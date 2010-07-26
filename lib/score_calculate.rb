module ScoreCalculate


  def z_score(fixnum_arr,retain_size= nil)
    arr = _z_score(fixnum_arr)
    if !retain_size.nil?
      return arr.map{|i| i.round(retain_size)}
    end
    arr
  end

  # 标准分数
  def _z_score(fixnum_arr)
    # 平均数
    mean_score = mp_mean(fixnum_arr)
    # 标准差
    standard_deviation = standard_deviation(fixnum_arr)
    if standard_deviation == 0
      return Array.new(fixnum_arr.size).map {|i|0.0}
    end
    fixnum_arr.map do |num|
      ((num - mean_score)/standard_deviation)
    end
  end

  # 标准差
  def standard_deviation(fixnum_arr,retain_size=nil)
    vari = Math.sqrt(variance(fixnum_arr))
    if !retain_size.nil?
      return vari.round(retain_size)
    end
    vari
  end

  # 方差
  def variance(fixnum_arr)
    x = quadratic_difference_sum(fixnum_arr).to_f
    x/(fixnum_arr.size)
  end

  # 每个数和平均数的差值 的平方 相加的和
  def quadratic_difference_sum(fixnum_arr)
    mean_score = mp_mean(fixnum_arr)
    sum_difference = 0
    fixnum_arr.each{|num| sum_difference += quadratic_difference(mean_score,num)}
    sum_difference
  end

  # 平均数
  def mp_mean(arr)
    sum=0
    arr.each { |x| sum += x}
    sum.to_f/(arr.size)
  end

  # 两个数差值的平方
  def quadratic_difference(mean_score,score)
    x = mean_score - score
    x * x
  end
end