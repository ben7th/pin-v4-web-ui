class MessagesController < ApplicationController
  before_filter :pre_load, :except=>:destroy
  def pre_load
    @message = Message.find(params[:id]) if params[:id]
    @reply_message = Message.find(params[:message][:reply_to]) if params[:message] && params[:message][:reply_to]
    @box = params[:box]
  end

  def index
    @messages = current_user.get_box_messages_paginate(@box,params[:page])
  end

  def new
    if !@reply_message
      return
    end
    _reply
  end

  def _new
    message = Message.new
    _render_new_form(message)
  end

  def _render_new_form(message)
    render_ui {|ui|ui.cell message,:position=>:paper,:partial=>'messages/cell_form_message'}
  end

  def _reply
    message = Message.new({:reply_message => @reply_message})
    render_ui do |ui|
      # 隐藏回复按钮，并在后边增加一个表单
      ui.page << %`
        $$('ul.messages').each(function(ul){
          var a = ul.up('div').down('a.reply')
          a.addClassName('hide')
          new Insertion.After(a,#{_form_message_html(message).to_json})
        })
      `
    end
  end

  def _form_message_html(message)
    @template.render(:partial=>'messages/form_message',:locals=>{:message=>message})
  end

  # ------------------- 以上为显示消息表单相关方法

  def create
    message = Message.new_from_params(params,current_user)
    if message.save
      # 创建成功
      return _create(message)
    end
    # 创建失败 错误校验
    _create_failure(message)
  end

  def _create(message)
    if message.draft?
      return render_ui{|ui|}
    end
    render_ui do |ui|
      if !@reply_message
        _render_root_create(ui,message)
      else
        _render_reply_create(ui,message)
      end
    end
  end

  def _create_failure(message)
    if !@reply_message
      return _root_create_failure(message)
    end
    _reply_create_failure(message)
  end

  def _render_root_create(ui,message)
    ui.cell message,:position=>:paper,:partial=>'messages/cell_show'
  end

  def _render_reply_create(ui,message)
    # 显示回复按钮
    # 删除表单DOM
    ui.page << %`
      $$('ul.messages').each(function(ul){
        var a = ul.up('div').down('a.reply')
        a.removeClassName('hide')
        a.up('div').down('form').remove()
      })
    `
    ui.mplist :insert,[message.root,message],:partial=>'messages/detail_message'
  end
  
  def _reply_create_failure(message)
    render_ui do |ui|
      form_html = @template.render(:partial=>'messages/form_message',:locals=>{:message=>message})
      ui.page << %`
        $$('ul li#message_#{@reply_message.id} form').each(function(f){
          f.replace(#{form_html.to_json})
        })
      `
    end
  end

  def _root_create_failure(message)
    _render_new_form(message)
  end

  # ----------------------

  def show
    @message = Message.find(params[:id])
    @message.reading_of!(current_user).read!
  end

  def destroy
    message = Message.find_by_uuid(params[:id])
    if message && message.draft?
      message.destroy
    end
    render_ui do |ui|
      #nothing
    end
  end

  def autocomplete_participants
    prefix = params[:autocomplete_str]
    if stale?(:etag => autocomplete_http_etag(prefix))
      users =  User.fetch_str_cache(prefix)
      str = @template.render :partial=>'messages/autocomplete_participants',:locals=>{:users=>users}
      render :text=>str
    end
  end

  def zip_down_load
    zip_path = @message.export_attachments
    send_file zip_path,:filename=>@message.title + ".zip"
  end

  def edit_tags
    if params[:message_ids]
      return render_ui do |ui|
        ui.fbox :show,:partial=>'messages/form_tag',:locals=>{:message_ids=>params[:message_ids],:display_mode=>params[:display_mode]}
      end
    end
    render :text=>""
  end

  def update_tags
    @messages = Message.find(params[:message_ids])
    if params[:tags_str]
      @messages.each do |message|
        message.set_user_tags!(current_user,params[:tags_str])
      end
    end
    render_ui do |ui|
      @messages.each do |m|
        ui.mplist :update,m,:partial=>'messages/info_message',:locals=>{:display_mode=>params[:display_mode],:checked=>true}
      end
      ui.page.close_box
    end
  end
end