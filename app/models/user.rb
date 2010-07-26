# == Schema Information
# Schema version: 20091223090135
#
# Table name: users
#
#  id                :integer(4)      not null, primary key
#  login             :string(255)     default(""), not null
#  name              :string(255)     default(""), not null
#  hashed_password   :string(255)     default(""), not null
#  salt              :string(255)     default(""), not null
#  email             :string(255)     default(""), not null
#  sign              :string(255)     
#  active_code       :string(255)     
#  activated         :boolean(1)      not null
#  logo_file_name    :string(255)     
#  logo_content_type :string(255)     
#  logo_file_size    :integer(4)      
#  logo_updated_at   :datetime        
#  created_at        :datetime        
#  updated_at        :datetime        
#

# == Schema Information
# Schema version: 20090707030914
#
# Table name: users
#
#  id                :integer(4)      not null, primary key
#  name              :string(255)     default(""), not null
#  hashed_password   :string(255)     default(""), not null
#  salt              :string(255)     default(""), not null
#  email             :string(255)     default(""), not null
#  sign              :string(255)     
#  created_at        :datetime        
#  updated_at        :datetime        
#  active_code       :string(255)     
#  activated         :boolean(1)      not null
#  logo_file_name    :string(255)     
#  logo_content_type :string(255)     
#  logo_file_size    :integer(4)      
#  logo_updated_at   :datetime        
#  role              :string(255)     default("NORMAL")
#

require 'digest/sha1'
require 'uuidtools'
require 'RMagick'

class User < ActiveRecord::Base
  
  # 应用安装记录
  has_many :installings
  has_many :apps,:through=>:installings

  # 在线状态记录
  has_one :online_record,:dependent => :destroy

  # 访问记录信息
  has_many :view_records

  # select * from users inner join user_roles on users.id=user_roles.user_id inner join roles on roles.id=user_roles.role_id where roles.name="Admin"
  # type 的值有 Admin Student Teacher
  named_scope :role_of,lambda{|type|
    {
      :joins=>"inner join user_roles on users.id=user_roles.user_id inner join roles on roles.id=user_roles.role_id where roles.name='#{type}' "
    }
  }

  # logo
  @logo_path = "#{ATTACHED_FILE_PATH_ROOT}:class/:attachment/:id/:style/:basename.:extension"
  @logo_url = "#{ATTACHED_FILE_URL_ROOT}:class/:attachment/:id/:style/:basename.:extension"
  has_attached_file :logo,:styles => {:raw=>'500x500>',:medium=>"96x96#",:normal=>"48x48#",:tiny=>'32x32#',:mini=>'24x24#' },
    :path => @logo_path,
    :url => @logo_url,
    :default_url => "/images/logo/default_:class_:style.png",
    :default_style => :normal

  # 校验部分
  # 不能为空的有：用户名，登录名，电子邮箱
  # 不能重复的有：登录名，电子邮箱
  # 用户名：是2-20位的中文或者英文，但是两者不能混用
  # 两次密码输入必须一样，电子邮箱格式必须正确
  # 密码允许为空，但是如果输入了，就必须是4-32
  validates_presence_of :name
  validates_presence_of :email
  validates_uniqueness_of :email,:case_sensitive=>false,:on=>:create
  validates_format_of :email,:with=>/^([A-Za-z0-9_]+)([\.\-\+][A-Za-z0-9_]+)*(\@[A-Za-z0-9_]+)([\.\-][A-Za-z0-9_]+)*(\.[A-Za-z0-9_]+)$/

  validates_format_of :name,:with=>/^([A-Za-z0-9]{1}[A-Za-z0-9_]+)$|^([一-龥]+)$/
  validates_length_of :name, :in => 2..20

  validates_presence_of :password,:on=>:create
  validates_presence_of :password_confirmation,:on=>:create
  attr_accessor :password_confirmation
  validates_confirmation_of :password
  validates_length_of :password, :in => 4..32, :allow_blank=>true

  NAMES_OF_INHIBITING = ["mindpin","admin","管理员","版主"]

  # 用户在修改用户名的时候，不能使用未升级的老用户的用户名
  def validate
    if has_same_name_with_v09_user? || name_not_allowed?
      errors.add(:name,"你的用户名不可用")
    end
  end

  def has_same_name_with_v09_user?
    return false if self.is_v09?
    return !!User.find_by_name_and_v09_and_v09_up(self.name,true,false)
  end

  def name_not_allowed?
    NAMES_OF_INHIBITING.include?(self.name.downcase)&&!self.is_admin?
  end

  named_scope :recent,lambda{|*args|
    {:limit=>args.first||5}
  }

  # 以下的若干个变量以及方法为认证部分相关代码
  # cookie登陆令牌中用到的加密字符串
  @@token_key='onlyecho'

  # 根据传入的邮箱名和密码进行用户验证
  def self.authenticate(email,password)
    user=User.find_by_email(email)
    if user
      expected_password = encrypted_password(password,user.salt)
      if user.hashed_password != expected_password
        user=nil
      end
    end
    user
  end

  # 老用户登录之后，根据输入的用户名和密码进行用户的验证
  def self.v09_authenticate(name,password)
    user=User.find_by_name_and_v09_and_v09_up(name,true,false)
    if user
      expected_password = encrypted_password(password,user.salt)
      if user.hashed_password != expected_password
        user=nil
      end
    end
    user
  end

  # 电子邮箱或用户名 认证
  def self.authenticate2(email_or_name,password)
    user = self.authenticate(email_or_name,password)
    if user.blank?
      users = User.find_all_by_name(email_or_name)
      users.each do |u|
        expected_password = encrypted_password(password,u.salt)
        if u.hashed_password == expected_password
          return u
        end
      end
    end
    return user
  end

  # 验证cookies令牌
  def self.authenticate_cookies_token(token)
    t=token.split(':')
    user=User.find_by_name(t[0])
    if user
      if t[2]!=hashed_token_string(user.name,user.hashed_password)
        user=nil
      end
    end
    user
  end

  # 创建cookies登录令牌
  def create_cookies_token(expire)
    value=self.name+':'+expire.to_s+':'+User.hashed_token_string(self.name,self.hashed_password)
    {:value=>value,:expires => expire.days.from_now}
  end

  def password
    @password
  end

  # 根据传入的明文密码，创建内部密钥并计算密文密码
  def password=(pwd)
    @password=pwd
    return if pwd.blank?
    create_new_salt
    self.hashed_password=User.encrypted_password(self.password,self.salt)
  end

  # 创建注册激活码
  def create_activation_code
    self.activation_code = UUID.random_create.to_s
  end

  # 发送激活邮件
  def send_activation_mail
    self.create_activation_code if self.activation_code.blank?
    self.save(false)
    UserObserver.instance.send_activation_mail(self)
  end

  # 是否激活
  def activated?
    !activated_at.blank?
  end

  # 激活
  def activate
    self.activation_code = nil
    self.activated_at = Time.now
    self.save(false)
  end
  
  # 密码重设，并发送邮件
  def forgot_password
    @forgotten_password = true
    self.make_password_reset_code
    self.save
    UserObserver.instance.send_forgotpassword_mail(self)
  end

  protected
  def make_password_reset_code
    self.reset_password_code = Digest::SHA1.hexdigest(Time.now.to_s.split(//).sort_by{rand}.join)
    self.reset_password_code_until = Time.now.next_year
  end

  # 使用SHA1算法生成令牌字符串
  private
  def self.hashed_token_string(name,hashed_password)
    Digest::SHA1.hexdigest(name+hashed_password+@@token_key)
  end

  # 使用SHA1算法，根据内部密钥和明文密码计算加密后的密码
  private
  def self.encrypted_password(password,salt)
    string_to_hash = password + 'jerry_sun' + salt
    Digest::SHA1.hexdigest(string_to_hash)
  end

  # 随机生成内部密钥
  private
  def create_new_salt
    self.salt = self.object_id.to_s + rand.to_s
  end

  public
  #  def apps
  #  App.all
  #  end

  def ext_apps
    self.apps.ext + self.apps.mps
  end

  # 创建扩展应用cookies登陆令牌
  def create_app_cookies_token(app,expire=nil)
    value=self.name+':'+expire.to_s+':'+User.hashed_app_token_string(app,self.name,self.hashed_password)
    if expire.blank?
      {:value=>value,:domain=>"#{App.get_site_name}"}
    else
      {:value=>value,:domain=>"#{App.get_site_name}",:expires=>expire.days.from_now}
    end
  end

  # 清除扩展应用cookies登陆令牌
  def clear_app_cookies_token
    {:value=>'nil',:expires=>-1.days.from_now,:domain=>App.get_site_name}
  end

  # 验证扩展应用cookies令牌
  def self.authenticate_app_cookies_token(token,app_name)
    t=token.split(':')
    user=User.find_by_name(t[0])
    app = user.ext_apps.select{|a| a[:name]==app_name}[0]
    if user
      if t[2]!=User.hashed_app_token_string(app,user.name,user.hashed_password)
        user=nil
      end
    end
    user
  end

  private
  # 使用SHA1算法生成扩展应用令牌字符串
  def self.hashed_app_token_string(app,name,hashed_password)
    Digest::SHA1.hexdigest(name+hashed_password+@@token_key+app[:token_key])
  end

  public
  include Message::UserMethods

  # 显示用户角色
  def role_str
    case self.role
    when'Admin' then role_str = I18n.t('model.user.admin_role')
    when'Teacher' then role_str = I18n.t('model.user.teacher_role')
    when'Student' then role_str = I18n.t('model.user.student_role')
    else role_str = I18n.t('model.user.normal_role')
    end
    return role_str
  end

  # 根据角色名找到所有的人
  def self.find_all_by_role_name(role_name)
    User.all.map do |user|
      user if user.role==role_name
    end.compact
  end

  # Start of code needed for the declarative_authorization plugin
  #
  # Roles are stored in a serialized field of the User model.
  # For many applications a separate UserRole model might be a
  # better choice.
  #  serialize :roles, Array

  # The necessary method for the plugin to find out about the role symbols
  # Roles returns e.g. [:admin]
  def role_symbols
    @role_symbols ||= (roles || []).map {|r| r.name.downcase.to_sym}
  end

  def User.parse_users(users)
    if users.blank?
      return []
    elsif users.instance_of?(User)
      return [users]
    elsif users.instance_of?(Array)
      return users
    elsif users.instance_of?(String)
      return users.split(',').map{|name| User.find_by_name(name)}.compact
    else
      raise('消息接收者参数错误')
    end
  end

  # 是老用户 返回true
  # 不是老用户 返回false
  def is_v09?
    return self.v09 && !self.v09_up
  end

  # 用户升级，将本身的字段v09_uo改为true，然后安装mind_pin 应用，并设置为默认为默认应用
  def upgrade(install_mindmap)
    self.update_attribute(:v09_up,true)

    if !!install_mindmap
      app = App.find_by_name(App::MINDMAP_EDITOR)
      if app
        install = Installing.find_by_user_id_and_app_id(self.id,app.id)
        install.destroy if install
        Installing.create(:user=>self,:app=>app,:is_default=>true,:usually_used=>true)
      end
    end

    achievement = Achievement.find_or_create_by_name(Achievement::EXPERIENCED)
    self.achievements << achievement
    Mailer.deliver_send_upgrade_v09(self)
  end

  def copper_logo(params)
    img = Magick::Image::read(File.new(self.logo.path(:raw))).first
    img.crop!(params[:x1].to_i, params[:y1].to_i,params[:width].to_i, params[:height].to_i,true)
    _resize(img)
  end

  def _resize(img)
    #    {:raw=>'500x500>',:medium=>"96x96#",:normal=>"48x48#",:tiny=>'32x32#',:mini=>'24x24#' }
    _resize_logo(img,"medium",96,96)
    _resize_logo(img,"normal",48,48)
    _resize_logo(img,"tiny",32,32)
    _resize_logo(img,"mini",24,24)
  end

  def _resize_logo(img,type,width,height)
    img_type = img.resize(width,height)
    img_type.write File.expand_path(ATTACHED_FILE_PATH_ROOT)+"/users/logos/#{self.id}/#{type}/#{self.logo_file_name}"
  end

  # 得到用户近期创建的导图
  def get_recently_mindmaps
    url = "#{App::MINDMAP_EDITOR_SITE}/users/#{self.id}/mindmaps/recently"
    response_body = HandleGetRequest.get_response_from_url(url)
    # response是空的时候返回false，说明是应用正在维护
    # 如果是一个用户没有创建任何导图，但是应用开启中，返回的不是空，而是一段xml
    return false if response_body.blank?
    mindmaps_arr = []
    Nokogiri::XML(response_body).css('mindmap').each do |mindmap|
      title = mindmap.css('title')[0].text
      logo = mindmap.css('logo')[0].text
      id = mindmap.css('id')[0].text
      href = "#{THIS_SITE}app/#{App::MINDMAP_EDITOR}/mindmaps/#{id}"
      mindmaps_arr << {:href=>href,:title=>title,:logo=>logo}
    end
    return mindmaps_arr
  end

  include TagCombo::UserMethods
  include Tag::UserMethods
  include Reading::UserMethods
  include Recycler::UserMethods
  include UserRole::UserMethods
  include Remark::Rate::RateableMethods
  include Entry::UserMethods
  include Preference::UserMethods
  include AutoCompeleteCache
  include App::UserMethods
  include Contacting::HostMethods
  include Invitation::HostMethods
  include Share::UserMethods
  include Feeling::UserMethods
  include Report::UserMethods
  include Achievement::UserMethods
end
