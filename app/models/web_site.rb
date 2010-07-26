class WebSite < ActiveRecord::Base

  validates_presence_of :domain

  before_create :set_page_rank
  def set_page_rank
    self.page_rank = GooglePageRank.new(self.domain).page_rank
  end

  # 找到 domain 是 self.domain 的 所有 bookmark_entry
  def relative_bookmark_entries
    @relative_bookmark_entries ||= BookmarkEntry.find_all_by_site(self.domain)
    return @relative_bookmark_entries
  end

  def relative_urls
    @relative_bookmark_entries ||= BookmarkEntry.find_all_by_site(self.domain)
    @relative_bookmark_entries.map{|rbe| rbe.url}
  end

  def creators_of_relative_bookmark_entries
    @relative_bookmark_entries ||= BookmarkEntry.find_all_by_site(self.domain)
    users = @relative_bookmark_entries.map{|rbe| rbe.entry.user}
    users.uniq!
    return users
  end

  def self.create_web_site(domain)
    web_site = WebSite.find_by_domain(domain)
    if web_site.blank?
      response = HandleGetRequest.get_response_from_url("http://#{domain}/")
      xml_content = Nokogiri::HTML(response)
      title = xml_content.css("title")[0].inner_html
      key_words,description = "",""
      xml_content.css("meta").each do |meta|
        name_attr = meta.attribute("name")
        next if name_attr.blank?
        case name_attr.value.downcase
        when "keywords" then key_words = meta.attribute("content").value
        when "description" then description = meta.attribute("content").value
        end
      end
      return WebSite.create(:domain=>domain,:title=>title,:key_words=>key_words,:description=>description)
    end
    return web_site
  end

  include Comment::MarkableMethods
  include Feeling::FeelableMethods
  include Introduction::IntroductableMethods
end