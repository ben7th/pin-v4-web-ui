# == Schema Information
# Schema version: 20091223090135
#
# Table name: messages
#
#  id               :integer(4)      not null, primary key
#  sender_id        :integer(4)      not null
#  message_topic_id :integer(4)      not null
#  content          :string(255)     default(""), not null
#  hidden           :boolean(1)      not null
#  created_at       :datetime        
#  updated_at       :datetime        
#

class Message < ActiveRecord::Base
  acts_as_nested_set
  
  def initialize(*args)
    super(*args)
    self.uuid ||= UUID.random_create.to_s
  end

  # 定义分页时，每页的数目
  def self.per_page
    20
  end

  has_many :readings,:class_name=>'MessageReading',:foreign_key=>'message_id',:dependent => :destroy
  has_many :participatings,:dependent=>:destroy
  has_many :participants,:through=>:participatings,:source=>:user
  def logic_participants
    if !self.root? && self.participatings.blank?
      return self.parent.logic_participants
    end
    return self.participants
  end

  def logic_participants_str
    logic_participants.map{|user|user.name}*","
  end
  
  belongs_to :creator,:class_name=>'User',:foreign_key=>'creator_id'

  validates_presence_of :creator
  validates_presence_of :content,:if=>Proc.new {|m| m.draft==false }

  def self.new_from_params(params,sender)
    message = Message.find_by_uuid(params[:message][:uuid])
    if !message.blank?
      message.draft = params[:message][:draft]
      message.title = params[:message][:title]
      message.content = params[:message][:content]
      message.participant_ids = params[:message][:participant_ids]
      message.entry_ids = params[:entry_ids]
      return message
    end
    message = Message.new(params[:message])
    message.entry_ids = params[:entry_ids]
    message.creator = sender
    return message
  end

  def reply_message
    @reply_message ||self.parent
  end

  def reply_message=(reply_message)
    @reply_message = Message.find(reply_message)
  end

  def reply_to
    if @reply_message.blank?
      return self.parent.id
    end
    return @reply_message.id
  end

  def reply_to=(reply_message_id)
    @reply_message = Message.find(reply_message_id)
  end

  before_save :add_creator_to_participant
  def add_creator_to_participant
    if !self.participant_ids.blank? || self.reply_message.blank?
      # 此处必须这样写 因为 << 的方法被重载了，不会导致数据变化
      self.participant_ids = (self.participant_ids + [self.creator_id]).uniq
    end
    true
  end

  before_save :set_title
  def set_title
    if self.title.blank?
      self.title = "(无标题)"
    end
  end
  
  before_create :set_namespace
  def set_namespace
    self.namespace = 'site_mail' if self.namespace.blank?
    return true
  end

  after_save :set_reply_message
  def set_reply_message
    if !@reply_message.blank? && self.parent.blank?
      self.move_to_child_of(@reply_message)
    end
    return true
  end

  after_save :send_message_by_juggernaut
  def send_message_by_juggernaut
    begin
      if !self.draft?
        Juggernaut.send_to_clients("show_fbox('新的消息')", self.participants.map{|re|re.id.to_s}.flatten)
      end
    rescue Errno::ECONNREFUSED => ex
      logger.debug('发送消息时 Juggernaut 连接失败')
    end
    return true
  end

  # 创建或更新 这个message 的发件人和收件人的 reading
  after_save :refresh_reading
  def refresh_reading
    if !self.reply_message.blank? && !self.draft?
      self.logic_participants.each do |user|
        reading = self.root.reading_of(user)
        if reading
          reading.update_attributes(:unread=>true,:hidden=>false)
        end
      end
    end
    return true
  end

  #  # 创建或更新 这个message 的发件人和收件人的 reading
  #  after_save :refresh_reading
  #  def refresh_reading
  #    return create_readings_for_first_message if self.reply_message.blank?
  #    create_or_refresh_readings_for_reply_message
  #    return true
  #  end
  #
  #  # 当消息是话题的第一条消息时，为其创建 reading
  #  def create_readings_for_first_message
  #    # 处理发件人自己的 reading
  #    if !self.readings.find_by_receiver_id(self.sender.id)
  #      MessageReading.create!({:message=>self,:receiver=>self.sender,:unread_count=>0,:unread=>false,:hidden=>false})
  #    end
  #    # 为收件人列表的用户创建reading
  #    if !self.draft?
  #      self.receivers.each do |receiver|
  #        reading = self.readings.find_by_receiver_id(receiver.id)
  #        if reading
  #          reading.update_attributes(:unread_count=>1,:unread=>true)
  #        else
  #          MessageReading.create!({:message=>self,:receiver=>receiver,:unread_count=>1,:unread=>true,:hidden=>false})
  #        end
  #      end
  #    end
  #  end
  
  #  # 当本条消息是回复某一条消息时，为这条新消息的参与者（收件人和发件人）创建或刷新reading
  #  def create_or_refresh_readings_for_reply_message
  #    # 处理发件人的 reading
  #    sender_reading = self.root.readings.find_by_receiver_id(self.sender.id)
  #    if sender_reading.blank?
  #      MessageReading.create!({:message=>self.root,:receiver=>self.sender,:unread=>false,:hidden=>false,:unread_count=>0})
  #    else
  #      sender_reading.update_attributes(:unread=>false,:hidden=>false,:unread_count=>0)
  #    end
  #    # 处理收件人的 reading
  #    if !self.draft?
  #      receivers.each do |receiver|
  #        reading = self.root.readings.find_by_receiver_id(receiver.id)
  #        if reading.blank?
  #          reading = MessageReading.create({:message=>self.root,:receiver=>receiver,:unread=>true,:hidden=>false,:unread_count=>1})
  #        else
  #          reading.update_attributes(:unread=>true,:hidden=>false,:unread_count=>reading.unread_count + 1)
  #        end
  #      end
  #    end
  #  end

  # 回复本条消息时，为新消息提供默认的标题
  def reply_default_title
    return "Re:#{self.title}" if self.reply_message.blank?
    if self.title =~ /Re:./
      return self.title
    end
    return "Re:#{self.title}"
  end

  # 当前消息是否被 某user 读过
  def is_read?(user)
    message = self.root
    # 当前用户在当前主题的未读取的消息数量
    unread_messages_count = message.unread_count(user)
    # 当前主题中，和 user 相关的全部消息数量
    total_messages_count = message.in_messages_of(user).count
    # 当前消息属于当前话题的第几个
    current_index = message.in_messages_of(user).index(self) + 1
    current_index <= total_messages_count - unread_messages_count
  end

  # 当前的话题对于指定的user，有几条未读消息
  def unread_count(user)
    reading = self.readings.find_by_receiver_id(user.id)
    return reading.unread_count
  end
  
  def reading_of(user)
    readings = self.readings.find_all_by_receiver_id(user.id)
    only_reading = readings.first
    if readings.count > 1
      readings.shift
      readings.each do |reading|
        reading.destroy
      end
    end
    return only_reading
  end
  
  def reading_of!(user)
    only_reading = reading_of(user)
    if only_reading.nil?
      only_reading = MessageReading.create({:message=>self,:receiver_id=>user.id})
    end
    only_reading
  end

  # 找到这个话题内，发件人是 user 的消息(包括草稿)
  def out_messages_of(user)
    self.self_and_descendants.scoped(:conditions=>{:creator_id=>user.id},:order=>'updated_at')
  end
  
  # 找到这个话题内 user 参与的消息(不包括草稿)
  def in_messages_of(user)
    self.self_and_descendants.scoped(:conditions=>{:draft=>false},:order=>'updated_at').select{|message|message.logic_participants.include?(user)}
  end

  # 得到 user 用户在这个话题内的所有草稿
  def draft_messages_of(user)
    self.self_and_descendants.scoped(:conditions=>{:creator_id=>user.id,:draft=>true},:order=>'updated_at')
  end

  # 找到这个话题内 user 参与的消息（包括草稿）
  def in_messages_with_draft_of(user)
    self.self_and_descendants.select{|message|message.logic_participants.include?(user)}
  end

  #  # 找到这个话题内，发件人是 user 的消息(包括草稿)
  #  def out_messages_with_draft_of(user)
  #    self.self_and_descendants.scoped(:conditions=>{:creator_id=>user.id},:order=>'updated_at')
  #  end

  # 整个话题的非草稿消息
  def full_set_without_draft
    self.self_and_descendants.scoped(:conditions=>"draft = false",:order=>'updated_at')
  end

  # 整个话题的消息和自己的草稿
  def full_set_with_self_draft_of(user)
    self.self_and_descendants.scoped(:conditions=>"(creator_id = #{user.id} and draft = true) or draft = false")
  end

  # 消息是否有 文件附件 和 图片附件
  def attachment_state
    has_file, has_picture = false, false
    self.entries.type_of(FileEntry).each do |file_resource|
      has_picture = true if file_resource.resource.is_image?
      has_file = true if !file_resource.resource.is_image?
      if has_file && has_picture
        break
      end
    end
    return {:has_file=>has_file,:has_picture=>has_picture}
  end
  
  # 在整个话题的消息和自己的草稿中，是否有 文件附件 和 图片附件
  def full_set_attachment_state_of(user)
    has_file, has_picture = false, false
    full_set_with_self_draft_of(user).each do |message|
      has_file = true if message.attachment_state[:has_file]
      has_picture = true if message.attachment_state[:has_picture]
      if has_file && has_picture
        break
      end
    end
    return {:has_file=>has_file,:has_picture=>has_picture}
  end
  
  # 检测话题中是否有 user 的草稿
  def has_draft_message?(user)
    draft_number(user) != 0
  end
  
  # 当前话题中 user 的草稿数量
  def draft_number(user)
    draft_messages_of(user).count
  end

  # user 是否有 这个message 的草稿回复
  def has_draft_reply_message?(user)
    !!draft_reply_message_of(user)
  end

  # 得到 user 在这个message上的草稿回复
  def draft_reply_message_of(user)
    self.children(:conditions=>{:creator_id=>user.id,:draft=>true}).first
  end

  def top(namespace)
    return self.ancestors(:conditions=>['namespace = ?',namespace]).first
  end

  def up(namespace)
    return self.ancestors(:conditions=>['namespace = ?',namespace]).last
  end

  def down(namespace)
    return self.all_children({:conditions=>['namespace = ?',namespace]}).first
  end

  def bottom(namespace)
    return self.all_children({:conditions=>['namespace = ?',namespace]}).last
  end

  # 给User类添加的方法
  module UserMethods

    def self.included(base)
      base.has_many :readings,:foreign_key=>'receiver_id',:class_name=>'MessageReading',:conditions=>['message_readings.hidden = ?',false],:order=>'created_at desc'
      base.has_many :draft_messages,:foreign_key=>'sender_id',:class_name=>'Message',:conditions=>{:draft=>true, :hidden=>false},:order=>'created_at desc'
    end

    # 计算用户收件箱中的未读信息主题数量
    def inbox_unread_message_count
      self.readings.select{|reading| reading.is_unread?}.count
    end

    def inbox_unread_message_count_str
      return "(#{inbox_unread_message_count})" if inbox_unread_message_count !=0
      return ' '
    end

    def get_box_messages_paginate(box,current_page)
      if ['in','out','draft'].include?(box)
        eval "self.#{box}box_messages.paginate(:page=>current_page,:per_page=>Message.per_page)"
      end
    end

    # 发件箱的话题
    def outbox_messages
      sent_messages = Message.find(:all,
        :conditions=>["creator_id = ? and draft = ?",self.id,false],
        :order=>'updated_at desc')
      root_messages = sent_messages.map{|message|message.root}.uniq
      return _without_hidden(root_messages)
    end

    # 收件箱的话题
    def inbox_messages
      messages = Message.find(:all,
        :joins=>"join participatings on messages.id = participatings.message_id",
        :conditions=>"participatings.user_id = #{self.id} and messages.draft = false",
        :order=>"messages.updated_at desc")
      root_messages = messages.map{|message|message.root}.uniq
      root_messages = root_messages.sort {|a,b|b.full_set_without_draft.last.updated_at <=> a.full_set_without_draft.last.updated_at}
      return _without_hidden(root_messages)
    end

    # 草稿箱
    def draftbox_messages
      draft_messages = Message.find(:all,
        :conditions=>["creator_id = ? and draft = ?",self.id,true],
        :order=>'updated_at desc')
      root_messages = draft_messages.map{|message|message.root}.uniq
      return _without_hidden(root_messages)
    end

    def _without_hidden(messages)
      messages.select do |message|
        reading = message.reading_of(self)
        !(reading && reading.hidden == true)
      end
    end
  end

  require 'zip/zipfilesystem'
  require 'zip/zip'
  require 'uuidtools'
  # 导出host中的所有附件到一个zip文件中
  def export_attachments
    zip_path = Dir::tmpdir + '/'+ UUID.random_create.to_s + ".zip"
    zip = Zip::ZipFile.open(zip_path, Zip::ZipFile::CREATE)
    self.entries.type_of("file").each do |file_type_entry|
      zip.add(file_type_entry.resource.title,file_type_entry.resource.content.path)
    end
    zip.close
    return zip_path
  end

  include Tag::TaggableMethods
  include Requirement::HostMethods
  include Entry::HostMethods
end
