class Remark::Rate < ActiveRecord::Base
  set_table_name :remark_rates

  belongs_to :user
  belongs_to :rateable,:polymorphic => true

  validates_presence_of :user
  validates_presence_of :rateable

  module RateableMethods
    def self.included(base)
      base.has_many :remark_rates,:as=>:rateable,:class_name=>"Remark::Rate"
    end

    # 打分的学生
    def rated_users
      remark_rates.map{|rate| rate.user }
    end

    # 检测用户user是否已经给这个rateable评过分
    def has_rated_by(user)
      self.remark_rates.each do |rate|
        return true if(rate.user == user)
      end
      return false
    end

    # 返回这个execution的平均数
    def average_rate
      max = self.remark_rates.inject(0) do |max,remark_rate|
        max += remark_rate.rate
      end
      return (max*1.0)/self.remark_rates.count if self.remark_rates.count>0
      return nil if self.remark_rates.count == 0
    end

    def average_rate_str
      x = average_rate
      return 'N/A' if x.nil?
      x
    end

    # 对这个 execution 的所有打分的标准差
    def rates_standard_deviation
      return nil if self.remark_rates.count == 0
      rates = self.remark_rates.map do |remark_rate|
        remark_rate.rate
      end
      rates.standard_deviation
    end

    def rates_standard_deviation_str
      x = rates_standard_deviation
      return 'N/A' if x.nil?
      x
    end

    # 某人给rateable的打分分值
    def rate_of_user(user)
      self.remark_rates.find_by_user_id(user.id).rate
    end

  end
  
end
