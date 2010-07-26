class UpdateRssFeedScript < ActiveRecord::Base

  p "共有订阅源 #{RssFeed.count} 个 现在开始更新 "

  RssFeed.all.each_with_index do |rss_feed,index|
    title = rss_feed.title
    p "------------------------------------"
    begin
      p "#{index+1} #{title} 正在更新..."
      items = rss_feed.update_items
      p "新添了 #{items.size} 个条目"
    rescue Exception => ex
      p " #{title}更新时 出现异常 #{ex} "
      next
    end
  end
  
  p "更新完毕."
    
end
