module ReadableHelper
  def readable_content_area(readable)
    str = case readable
    when Entry
      render :partial=>"entries/cell_show",:locals=>{:entry=>@readable}
    when RssItem
      render :partial=>"rss_items/show",:locals=>{:rss_item=>@readable}
    when nil
      "该内容已被删除"
    end
    %~
      <div class="readable_content_area">
        #{str}
      </div>
    ~
  end

  def item_from_link(rss_item)
    rss_feed = rss_item.rss_feed
    "来源: #{link_to rss_feed.title,rss_feed.source,:target=>'_blank'}"
  end

  def item_text_description(rss_item,chars_num = 120)
    truncate_u(Nokogiri::HTML(rss_item.description).text,chars_num)
  end

  # 显示rss_item内容的时候 没有taget为_blank的链接增加 这个属性
  def add_target_blank_to_a_in_description(description)
    description = Nokogiri::HTML(description)
    description.css('a').each do |a_link|
      if a_link.attribute('target')
        a_link.attribute('target').value = '_blank'
      else
        a_link['target'] = '_blank'
      end
    end
    description.to_s
  end
end
