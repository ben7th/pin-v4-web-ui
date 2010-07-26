class Array
  extend ScoreCalculate

  def str_compact
    self.select do |str|
      unless str.blank? then str end
    end
  end

  # 标准分数
  def z_score(retain_size=nil)
    Array.z_score(self,retain_size)
  end

  # 标准差
  def standard_deviation(retain_size=nil)
    Array.standard_deviation(self,retain_size)
  end

  # 方差
  def variance
    Array.variance(self)
  end

  def to_brackets_str
    arr_str = self.map{|str| str.to_json}*","
    "(#{arr_str})"
  end
end