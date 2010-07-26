class AnnouncementLastMetal < BaseMetal
  def self.routes
    {:method=>'GET',:regexp=>/暂时不用，用到时，删除汉字announcements\/last/}
  end

  def self.deal(hash)
    announcement = Announcement.last
    return [200, {"Content-Type" => "text/plain"}, [announcement.content]]
  end
end
