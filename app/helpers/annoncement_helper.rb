module AnnoncementHelper
   def last_announcement
     begin
      Announcement.last.content
    rescue Exception => ex
      '<span class="error">没有新的系统公告</span>'
    end
   end
end
