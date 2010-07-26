# == Schema Information
# Schema version: 20091223090135
#
# Table name: system_settings
#
#  id                :integer(4)      not null, primary key
#  name              :string(255)     
#  footer_info       :text            
#  login_info        :text            
#  logo_file_name    :string(255)     
#  logo_content_type :string(255)     
#  logo_file_size    :integer(4)      
#  logo_updated_at   :datetime        
#  created_at        :datetime        
#  updated_at        :datetime        
#

class SystemSetting < ActiveRecord::Base
  # logo
  @logo_path = "#{ATTACHED_FILE_PATH_ROOT}:class/:attachment/:id/:style/:basename.:extension"
  @logo_url = "#{ATTACHED_FILE_URL_ROOT}:class/:attachment/:id/:style/:basename.:extension"
  has_attached_file :logo,:styles => { :normal=>"120x120>" },
    :path => @logo_path,
    :url => @logo_url,
    :default_url => "/images/logo/default_:class_:style.png",
    :default_style => :normal
end
