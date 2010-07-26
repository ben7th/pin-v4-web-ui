class ParseLostUserResult
  
  def get_result
    @file = File.open("#{RAILS_ROOT}/lib/script/result.txt")
    @count = 0
    @result = []
    @file.each do |line|
      ma = line.match(/"user"=>\{"name"=>"(.*)", "password_confirmation"=>"(.*)", "password"=>"(.*)", "email"=>"(.*)"\}\}/)
      name = ma[1]
      pass = ma[2]
      email = ma[4]
      @result << {:name=>name,:pass=>pass,:email=>email}
    end
    if @result.count == 470
      return @result
    else
      raise "解析有问题"
    end
  end

  # 用户的表单信息
  # {:pass=>"marilynmanson1@", :name=>"Liuzhuo", :email=>"lovesite12@gmail.com"}
  results = self.new.get_result
  User.transaction do
    results.each_with_index do |re,index|
      user = User.new(:name=>re[:name],:password_confirmation=>re[:pass],:password=>re[:pass],:email=>re[:email])
      user.create_activation_code
      if !user.valid?
        p "#{user.name} 失败"
      else
        p "save user #{index+1} :#{user.name} 成功"
        user.save
      end
    end
  end
end