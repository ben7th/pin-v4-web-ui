class Achievement < ActiveRecord::Base
  
  belongs_to :user

  V09_USER = "v09"

  HONOR_HASH = {
    'v09'=>['09级用户','2010年夏季改版前使用MindPin的老用户，账号升级纪念']
  }

  def self.honor_str(honor)
    return HONOR_HASH[honor][0]
  end

  def self.honor_description(honor)
    return HONOR_HASH[honor][1]
  end

  module UserMethods
    def self.included(base)
      base.has_many :achievements
    end
  end
end