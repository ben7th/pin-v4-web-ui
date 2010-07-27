module AnnoncementHelper
   def last_announcement
     begin
      Announcement.last.content
    rescue Exception => ex
      '<span class="error">系统公告读取异常</span>'
    end
   end
end
