class Report < ActiveRecord::Base
  belongs_to :reportable,:polymorphic => true
  belongs_to :creator,:class_name=>"User"

  validates_presence_of :reportable
  validates_presence_of :creator

  # "涉及意识形态的政治/宗教信息"
  POLITICAL = "POLITICAL"
  POLITICAL_STR = "涉及意识形态的政治/宗教信息"
  # "色情/暴力/低俗信息"
  PORNOGRAPHIC = "PORNOGRAPHIC"
  PORNOGRAPHIC_STR = "色情/暴力/低俗信息"
  # "人身攻击"
  ATTACK = "ATTACK"
  ATTACK_STR = "人身攻击"
  # "广告"
  ADVERTISEMENT = "ADVERTISEMENT"
  ADVERTISEMENT_STR = "广告"
  # "其他"
  OTHER = "OTHER"
  OTHER_STR = "其他"

  def reason_str
    case reason
    when Report::POLITICAL then Report::POLITICAL_STR
    when Report::PORNOGRAPHIC then Report::PORNOGRAPHIC_STR
    when Report::ATTACK then Report::ATTACK_STR
    when Report::ADVERTISEMENT then Report::ADVERTISEMENT_STR
    when Report::OTHER then Report::OTHER_STR
    end
  end

  def handle_by_admin(forbidden)
    self.update_attributes(:handled=>true) # 设置为已经处理
    if forbidden
      return self.reportable.update_attributes(:forbidden=>true)
    end
  end

  module ReportableMethods
    def self.included(base)
      base.has_many :reports,:as=>:reportable
    end

    # 判断此信息是否被usr被举报
    # 举报返回true，否则返回false
    def reported_by?(user)
      report = Report.find_by_creator_id_and_reportable_id_and_reportable_type(user.id,self.id,self.class.to_s)
      report.blank? ? false : true
    end
  end

  module UserMethods
    def self.included(base)
      base.has_many :reports,:foreign_key=>"creator_id"
    end
  end
  
end
