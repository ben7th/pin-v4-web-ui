Authorization.ignore_access_control(true)

# 预定义的角色
["Admin", "Teacher", "Student"].each do |name|
  Role.create!(:name => name)
end
p 'roles created.'

# 管理员用户
admin = User.new(:login=>'admin',:password=>'admin',:password_confirmation=>'admin',
  :name => '系统管理员',:activated=>true)
admin.roles << Role.find_by_name('Admin')
if admin.save
p 'admin user created.'
end

# 开发环境预置用户
if RAILS_ENV == 'development'
  lifei = User.new(:login=>'lifei',:password=>'123456',:password_confirmation=>'123456',
    :name => '李飞',:activated=>true)
  lifei.roles << Role.find_by_name('Teacher')
  lifei.save!

  chengliwen = User.new(:login=>'chinacheng',:password=>'123456',:password_confirmation=>'123456',
    :name => '程立文',:activated=>true)
  chengliwen.roles << Role.find_by_name('Teacher')
  chengliwen.save!

  ben7th = User.new(:login=>'ben7th',:password=>'123456',:password_confirmation=>'123456',
    :name => '宋亮',:activated=>true)
  ben7th.roles << Role.find_by_name('Teacher')
  ben7th.save!

  liyutong = User.new(:login=>'liyutong',:password=>'123456',:password_confirmation=>'123456',
    :name => '李雨桐',:activated=>true)
  liyutong.roles << Role.find_by_name('Student')
  liyutong.save!
end