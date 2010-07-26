class Announcement < ActiveRecord::Base
  validates_presence_of :content

  def self.last_content
    HandleGetRequest.get_response_from_url("#{THIS_SITE}announcements/last")
  end

  include Comment::MarkableMethods
end
