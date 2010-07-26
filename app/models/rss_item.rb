class RssItem < ActiveRecord::Base
  include Pacecar
  belongs_to :rss_feed
  
  named_scope :order_by_rand,:order=>"rand()"

  def self.get_random_readable_id_for_reads(user)
    while true
      RssFeed.connection.clear_query_cache
      rss_feed = RssFeed.find(:first,:order=>'rand()')
      rss_item = rss_feed.rss_items.find(:first,:order=>'rand()')

      if rss_item.blank?
        next # 如果 rss_item 为空 重新找
      end

      if !user.blank? && rss_item.feel_of(user) == Feeling::BAD
        next # 如果当前是登录后访问，而且用户曾经对这个条目有坏印象 重新找
      end

      # 没有任何重新找的必要，就返回找到的这条
      return rss_item
    end
  end

  # 解析rss中的items，并保存到数据库中
  def self.save_rss_items(result,rss_feed)
    result.items.each do |item|
      create_rss_item(item,rss_feed)
    end
  end

  # 创建一个rss_item
  def self.create_rss_item(item,rss_feed)
    title = item.title
    link = item.link
    pub_date = item.pubDate.to_datetime

    description = item.description
    content_encoded = item.content_encoded
    # 在创建rss_item的时候，如果存在 content_encoded 则用这个值覆盖description
    description = content_encoded if !content_encoded.blank?

    author = item.author
    dc_creator = item.dc_creator
    author = dc_creator if !dc_creator.blank?

    description = RssItem.handle_discription(description,rss_feed.source)
    img_url = self.parse_img_form_rss_description(description)
    RssItem.create(:rss_feed=>rss_feed,:title=>title,:link=>link,:author=>author,:description=>description,:pub_date=>pub_date,:img_url=>img_url)
  end

  def self.parse_img_form_rss_description(description)
    nok_description = Nokogiri::HTML(description)
    imgs = nok_description.css("img")
    return nil if imgs.blank?
    return imgs.first.attribute("src").value
  end


  # 处理description,将链接中的只有/开头的链接补全
  # 例如：/clicks/152 转化成：http://windytwang.javaeye.com/clicks/152
  def self.handle_discription(description,source)
    nok_description = Nokogiri::HTML(description)
    nok_description.css("a").each do |a_link|
      if a_link.attribute("href")
        value = a_link.attribute("href").value
        if value.match(/^\//)
          value = "#{source}#{value.sub("/","")}"
        end
        a_link.attribute("href").value = value
      end
    end
    return nok_description.css("body")[0].inner_html
  end

  # user 是否读过这条 item
  def read_by?(user)
    !!Reading.find_by_readable_id_and_readable_type_and_user_id(self.id,"RssItem",user.id)
  end

  include Feeling::FeelableMethods
  include Report::ReportableMethods
  include Share::ShareableMethods
  include Comment::MarkableMethods
  include Reading::ReadableMethods
end
