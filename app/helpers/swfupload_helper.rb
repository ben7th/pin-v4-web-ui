module SwfuploadHelper

  def simple_swf_upload(options)
    url = options[:url]
    name = options[:name]
    suffix = randstr
    single_file_name = "single_file_name_#{suffix}"
    single_add_file_btn = "single_add_file_#{suffix}"
    single_file_list = "single_file_list_#{suffix}"
    single_start_upload_btn = "start_upload_#{suffix}"
    %`
    <form action="#">
      <input id="#{single_file_name}" type="text"></input>
      <span id="#{single_add_file_btn}"></span>
      <input id="#{single_start_upload_btn}" type="button" value="#{t('page.form.submit')}" ></input>
      <div id="#{single_file_list}"></div>
    </form>

    <script type="text/javascript">
      new SWFUpload(
        {
          flash_url : "/javascripts/swfupload/swfupload.swf",
          upload_url: '#{url}',
          post_params: {
            "#{ActionController::Base.session_options[:key]}": "#{cookies[ActionController::Base.session_options[:key]]}",
            "authenticity_token" : '#{form_authenticity_token}'
          },
          file_post_name : "#{name}",
          file_size_limit : "20 MB",
          file_types : "*.*",
          file_types_description : "All Files",
          file_upload_limit : 100,
          file_queue_limit : 1,
          custom_settings : {
            progressTarget : "#{single_file_list}",
            inputFileName : "#{single_file_name}",
            startUploadBtn : "#{single_start_upload_btn}"
          },
          debug: false,

          // 选择文件的按钮样式
          button_image_url: "/javascripts/swfupload/XPButtonUploadText_61x22.png",
          button_width: "61",
          button_height: "22",
          button_placeholder_id: "#{single_add_file_btn}",

          swfupload_loaded_handler : single_file_upload.swfupload_loaded_handler,
          // 显示上传进度
          upload_progress_handler : single_file_upload.upload_progress_handler,
          // 文件不合法的错误提示
          file_queue_error_handler : single_file_upload.file_queue_error_handler,
          // 文件上传成功后，运行 rjs
          upload_success_handler : single_file_upload.upload_success_handler,
          // 向上传队列增加文件时,把文件名称显示出来
          file_queued_handler : single_file_upload.file_queued_handler,
          // 点击选择文件时运行,因为只上传一个文件，每次选择文件时，清空文件上传队列
          file_dialog_start_handler: single_file_upload.file_dialog_start_handler,
          // 上传出现异常时的处理
          upload_error_handler: single_file_upload.upload_error_handler
        }
      );
    </script>
    `
  end

  def attachment_swf_upload(options)
    url = options[:url]
    name = options[:name]
    attachment_list_id = options[:attachment_list_id]
    suffix = randstr
    upload_add_file_btn = "upload_add_file_#{suffix}"
    upload_file_list = "upload_file_list_#{suffix}"
    str = %`
    <div id="#{upload_file_list}"></div>
    <span id="#{upload_add_file_btn}"></span>
    `
    content_for :javascripts do
      %`
        <script type="text/javascript">
          new SWFUpload(
          {
            flash_url : "/javascripts/swfupload/swfupload.swf",
            upload_url: '#{url}',
            post_params: {
              "#{ActionController::Base.session_options[:key]}": "#{cookies[ActionController::Base.session_options[:key]]}",
              "authenticity_token" : '#{form_authenticity_token}'
            },
            file_post_name : "#{name}",
            file_size_limit : "20 MB",
            file_types : "*.*",
            file_types_description : "All Files",
            file_upload_limit : 100,
            file_queue_limit : 0,
            custom_settings : {
              progressTarget : "#{upload_file_list}",
              attachmentListId : "#{attachment_list_id}"
            },
            debug: false,

            // 增加文件按钮
            button_image_url: "/javascripts/swfupload/XPButtonUploadText_61x22.png",
            button_width: "61",
            button_height: "22",
            button_placeholder_id: "#{upload_add_file_btn}",

            // 显示上传进度
            upload_progress_handler : attachment_file_upload.upload_progress_handler,
            // 运行服务器传回的 rjs
            upload_success_handler : attachment_file_upload.upload_success_handler,
            // 开始上传,提供取消按钮
            upload_start_handler : attachment_file_upload.upload_start_handler,
            // 上传失败的错误提示
            upload_error_handler : attachment_file_upload.upload_error_handler,
            // 文件不合法的错误提示
            file_queue_error_handler : attachment_file_upload.file_queue_error_handler,
            // 增加文件立即上传
            file_queued_handler : attachment_file_upload.file_queued_handler,
            // 每个文件上传完成后运行
            upload_complete_handler : attachment_file_upload.upload_complete_handler
          });
        </script>
      `
    end
    return str
  end

  def pull_down_menu(&block)
    str = %`
    <div class="inline-menu">
      <div class="menu-icon"></div>
      <div class="menu-body" style="display:none;">
        <%=yield%>
      </div>
    </div>
    `
    inside_inline_layout(str,&block)
  end

  # 五星打分
  def show_star_box(options)
    options[:average] ||= 0
    %`
      <span id="star_box"></span>
      <script type="text/javascript">
        var options = {}
        options.stars=5
        options.buttons=5
        options.onRate = submitRate
        options.total = #{options[:total]}
        new Starbox($("star_box"),#{options[:average]},options);
        function submitRate(element,memo){
          new Ajax.Request(#{options[:url].to_json}, {
            parameters: memo,
            method: 'post',
            onComplete: function(xhr) {
              eval(xhr)
            }
          });
        }
      </script>
    `
  end

  # 根据file_entry的用途，得出这个文件被引用的地方
  def used_for_link_for_entry(entry)
    used = entry.used_for
    case used
    when Message
      return pages_link [used.content],:panel=>{:url=>messages_path,:method=>:get},:paper=>{:url=>message_path(used.root),:method=>:get}
    when nil
      return I18n.t("page.helper.page.old_object_deleted") if used.blank?
    when ""
      return ""
    end
  end


  def mp_submit_to_remote(name, value, options = {})
    options[:with] ||= %`
      Form.serializeElements($(#{options[:ul].to_json}).select("input"))
    `
    html_options = options.delete(:html) || {}
    html_options[:name] = name

    button_to_remote(value, options, html_options)
  end

end