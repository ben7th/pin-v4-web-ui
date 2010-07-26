class RssFeed < ActiveRecord::Base
  include Pacecar
  belongs_to :user
  has_many :subscription_entries
  has_many :rss_items,:order=>"pub_date desc"

  named_scope :order_by_rand,:order=>"rand()"

  validates_uniqueness_of :source

  before_save :set_title
  def set_title
    self.title = "无标题" if self.title.blank?
  end

  # 被订阅的数目
  def subscriber_count
    ses = SubscriptionEntry.find_all_by_rss_feed_id(self.id)
    ses.length
  end

  # 被分享的数目
  def share_items_count
    self.rss_items.find(:all,
      :joins=>"inner join shares on shares.shareable_type = \"RssItem\" and shares.shareable_id = rss_items.id",
      :group=>"rss_items.id"
    ).size
  end

  # 某订阅用户的未读数
  def unread_count(user)
    read_count = self.rss_items.find(:all,
      :joins=>"inner join readings on readings.readable_type = 'RssItem' and readings.readable_id = rss_items.id and readings.user_id = #{user.id}"
    ).size
    self.rss_items.count - read_count
  end

  # 订阅这个rss源的所有人
  def subscribers
    ses = SubscriptionEntry.find_all_by_rss_feed_id(self.id)
    ses.map{|se| se.user }.uniq.compact
  end

  # 检测这个rss源是否被user订阅过，如果订阅过返回true，如果没有返回false
  def subscripted_by?(user)
    sub = SubscriptionEntry.find_all_by_rss_feed_id_and_user_id(self.id,user.id)
    return sub.blank? ? false : true
  end

  require 'rss'
  require 'net/http'
  
  # 根据输入的url创建订阅源
  def self.create_rss_feed(url)
    # 解析url，提取rss源
    rss_source_url = RssFeed.get_rss_source_from_url(url)
    # 如果没有找到这个url则返回false
    return false if rss_source_url.blank?
    web_content = HandleGetRequest.get_response_from_url(rss_source_url)
    web_content = self.change_charset_if_gb2312(web_content)
    result = RSS::Parser.parse(web_content,false)
    # 创建rss_feed实例
    rss_feed = RssFeed.find_by_source(rss_source_url)
    if rss_feed.blank?
      rss_feed = RssFeed.create(:source=>rss_source_url,:title=>result.channel.title,:description=>result.channel.description)
      # 立即更新一次这个 rss_feed 获取 items
      rss_feed.update_items(result)
      return rss_feed
    end
    return rss_feed
  end

  # 根据输入的url提取rss源
  def self.get_rss_source_from_url(url)
    # 如果 是 qq
    return self.get_rss_url_from_qq(url) if url.to_i.to_s == url
    # 请求url 返回 web_content
    web_content = HandleGetRequest.get_response_from_url(url)
    if RssFeed.is_rss_content?(web_content)
      # 如果这个url直接就是 rss 源，直接返回
      return url
    else
      # 这个url不是rss源，则进一步处理
      special_url = RssFeed.deal_special_url(url)
      return special_url if special_url
      # 不是特殊的url，则老老实实地分析内容来获取rss源
      return RssFeed.get_rss_source_from_web_content(web_content)
    end
  end

  # 根据输入的qq 号 提取rss源
  def self.get_rss_url_from_qq(qq)
    rss_url = "http://feeds.qzone.qq.com/cgi-bin/cgi_rss_out?uin=#{qq}"
    if !Nokogiri::HTML(HandleGetRequest.get_response_from_url(rss_url)).css("error").blank?
      raise "QQ号无效"
    end
    return rss_url
  end

  # 判断并处理特殊url，比如donews javaeye
  # 如果是特殊url，直接返回按规则取得的rss源
  # 如果不是特殊url，返回nil
  def self.deal_special_url(url)
    # javaeye网站博客的特殊处理
    if url.match(/.*.javaeye.com/)
      if url.match(/\/$/)
        return url + "rss"
      else
        return url + "/rss"
      end
    end
    # donews网站博客的特殊处理
    if url.match(/blog.donews.com/)
      if url.match(/\/$/)
        return url + "feed"
      else
        return url + "/feed"
      end
    end
  end

  # 判断传入的web_content是不是rss正文
  def self.is_rss_content?(web_content)
    result = nil
    begin
      web_content = self.change_charset_if_gb2312(web_content)
      result = RSS::Parser.parse(web_content,false)
    rescue Exception => ex
      #      p ex
      return false
    end
    return result.blank? ? false :true
  end

  # 从传入的web_content正文中根据 application/rss+xml 获取rss源
  # 如有多个，暂时先去第一个
  def self.get_rss_source_from_web_content(web_content)
    begin
      rss_link = Nokogiri::HTML(web_content).css("link[type='application/rss+xml']")[0]
      return rss_link.attribute('href').value if !rss_link.blank?
      return nil
    rescue Exception => ex
      return nil
    end
  end

  # 如果xml的编码格式是gb2312，先把它转成gb18030
  # gb2312转utf8的时候会出现问题
  def self.change_charset_if_gb2312(web_content)
    if Nokogiri::XML(web_content).encoding == 'gb2312'
      web_content.sub!(/gb2312/,'gb18030')
    end
    return web_content
  end

  # 解析rss_feed是否有新的条目，如果有返回新加的条目，并且添加到数据库中
  def update_items(result=nil)
    items = []
    if result.blank?
      web_content = HandleGetRequest.get_response_from_url(self.source)
      web_content = RssFeed.change_charset_if_gb2312(web_content)
      result = RSS::Parser.parse(web_content,false)
    end
    return items if result.blank?
    result.items.each do |item|
      rss_item = RssItem.find_by_link(item.link)
      if rss_item.blank?
        items << RssItem.create_rss_item(item,self)
        _create_share_for_claimer(item)
      end
    end
    return items
  end

  # 为 rss_feed 的 人领者创建一个 分享
  def _create_share_for_claimer(item)
    title = item.title
    link = item.link
    if self.user
      Share.create!(:creator=>self.user,:content=>"#{title} #{link}",:kind=>Share::TALK)
    end
  end

  # user 的认领码
  def claim_code_of(user)
    if self.claim_code.blank?
      self.update_attribute(:claim_code,randstr(16))
    end
    Digest::SHA1.hexdigest("#{self.claim_code}_#{user.id}")
  end

  # user 认领
  def claim(user)
    if valid_claim?(user)
      self.update_attribute(:user_id,user.id)
      return true
    end
    return false
  end


  # 验证
  def valid_claim?(user)
    self.update_items
    self.reload
    code = self.claim_code_of(user)
    self.rss_items.each do |r_i|
      if r_i.title.match(code) || r_i.description.match(code)
        return true
      end
    end
    return false
  end
  
  include Feeling::FeelableMethods
  include Remark::RemarkMethod
  include Comment::MarkableMethods
  include Introduction::IntroductableMethods
end
