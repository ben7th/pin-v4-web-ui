
ActionController::Routing::Routes.draw do |map|
  
  map.root :controller=>'index'
  #  map.root :controller=>'index',:action=>'updating'
  map.dev '/index',:controller=>'index',:action=>'index'
  map.dev '/dev',:controller=>'index',:action=>'dev'
  map.csstest '/csstest.:format',:controller=>'index',:action=>'csstest'
  map.welcome '/welcome',:controller=>'index',:action=>'welcome'
  map.v09 '/v09',:controller=>'index',:action=>'v09'
  map.v09_up '/v09_up',:controller=>'index',:action=>'v09_up'
  
  # ---------------- 功能演示 ---------------
  map.namespace :demo do |demo|
    demo.root :controller=>'index',:action=>'index'
  end
  
  # ---------------- 用户认证相关 -----------

  map.login_ajax '/login_ajax',:controller=>'sessions',:action=>'new_ajax'
  map.login_fbox '/login_fbox',:controller=>'sessions',:action=>'login_fbox'
  map.login_fbox_create '/login_fbox_create',:controller=>'sessions',:action=>'login_fbox_create'
  map.login '/login',:controller=>'sessions',:action=>'new'
  map.v09_login "/v09_login",:controller=>'sessions',:action=>'v09_new'
  map.logout '/logout',:controller=>'sessions',:action=>'destroy'
  map.signup '/signup',:controller=>'users',:action=>'new'

  map.help '/help',:controller=>'help',:action=>'help'
  map.aboutus '/aboutus',:controller=>'help',:action=>'aboutus'
  map.cooperation '/cooperation',:controller=>'help',:action=>'cooperation'

  map.collector '/collector',:controller=>'collector',:action=>'new'
  map.collector_create '/collectors',:controller=>'collector',:action=>'create'

  map.resource :session
  map.resources :online_records

  map.resources :users,:member=>{
    :logo=>:put,:edit_logo=>:get
  },:collection=>{:send_activation_mail=>:get} do |user|
    user.resource :entry_show,:collection=>{:iframe=>:get}
    user.resources :follows
    user.resources :fans
    user.resources :readings
    user.resource :work_board
  end

  map.resources :contactings,:controller=>'contactings',:collection=>{:selector=>:get}

  map.activate '/activate/:activation_code',:controller=>'users',:action=>'activate'

  map.forgot_password_form '/forgot_password_form',:controller=>'users',:action=>'forgot_password_form'
  map.forgot_password '/forgot_password',:controller=>'users',:action=>'forgot_password'

  map.reset_password '/reset_password/:pw_code',:controller=>'users',:action=>'reset_password'
  map.change_password '/change_password/:pw_code',:controller=>'users',:action=>'change_password'

  map.resources :invitations
  map.invit_signup '/invit_signup/:uuid',:controller=>"invitations",:action=>"invit_signup"
  map.invit_create '/invit_create/:uuid',:controller=>"users",:action=>"invit_create"

  map.resource :contacts,:collection=>{:find=>:get}

  map.resources :announcements,:collection=>{:last=>:get},:member=>{:last_comments=>:get} do |announcement|
    announcement.resources :comments,:collection=>{:newest=>:get}
  end

  # ----------------- 采集器相关 ----------

  map.resources :web_site_remarks,:collection=>{:summary=>:post}
  map.resources :web_sites do |web_site|
    web_site.resource :feeling
    web_site.resources :introductions
  end

  map.resources :rss_feeds,:member=>{:claim=>:put,:claim_tip=>:get} do |rss_feed|
    rss_feed.resource :feeling
    rss_feed.resources :comments
    rss_feed.resources :introductions
  end

  # ----------------- 资源相关 ----------

  map.resources :entries,:member=>{:snapshot=>:get,:snapshot_html=>:get,:send_zip_email=>:get,:send_email=>:get,:download=>:get,:zip_download=>:get},
    :collection=>{:destroys=>:delete,:edit_tags=>:get,:update_tags=>:put,:selector=>:get,:search=>:get} do |entry|
    entry.resources :tags
    entry.resources :image_marks
    entry.resources :comments
    entry.resources :reports
    entry.resources :shares
    entry.resource :feeling
  end
  map.reader '/reader',:controller=>'reader',:action=>'index'
  map.reader_next '/reader/next',:controller=>'reader',:action=>'next_one'
  map.reader_unlike '/reader/unlike',:controller=>'reader',:action=>'unlike'

  map.resources :reports
  map.resources :readings
  map.resources :feelings
  map.resources :comments
  map.resources :subscription_entries

  map.resources :subscriptions,:controller=>"subscription_entries",:path_prefix => '/reader'

  map.resources :rss_items do |rss_item|
    rss_item.resources :comments
    rss_item.resources :reports
    rss_item.resources :shares
    rss_item.resources :readings,:collection=>{:unread=>:delete}
    rss_item.resource :feeling
  end

  map.resources :shares,:collection=>{:img=>:post,:video=>:post,:audio=>:post,:audio_valid=>:post} do |share|
    share.resources :shares
    share.resource :feeling
  end

  map.url_code '/url/:code',:controller=>"short_urls",:action=>"show"
  # ----------------- 短讯相关 ----------

  map.resources :messages,:member=>{:zip_down_load=>:get},:collection=>{
    :autocomplete_participants=>:get,
    :update_tags=>:put,
    :edit_tags=>:get
  }
  map.resources :message_attachments
  
  map.resources :message_readings,:collection=>{
    :destroys=>:put,
    :mark=>:put
  }

  # ----------------- 设置相关 ----------

  map.resources :settings
  map.resource :preference,:collection=>{:selector=>:get,:ajax_theme_change=>:get}

  # ----------------- TAG相关 ----------

  map.resources :tags,:collection=>{:selector=>:get,:merge_form=>:get,:merge=>:post}
  map.get_taggables_by_tag '/tags/:tag_name',:controller=>'tags',:action=>'show'
  map.resources :tag_combos
  map.resource :recycler,:member=>{:recover=>:put}


  # ----------------- 应用相关 ----------

  map.resources :installings,:collection=>{:install_mindmap=>:post}
  map.resources :apps,:collection=>{:installed=>:get}

  map.connect "/app/:name/:path",
    :controller=>'app_render',:action=>'pack',
    :requirements=>{:name=>/\w+/,:path=>/.+/},:path=>''
  
  # ---------------- 管理员 ---------------------
  map.namespace :admin do |admin|
    admin.resources :apps
    admin.resources :reports
    admin.resources :announcements
  end
  map.admin_index '/admin/index',:controller=>"admin/index",:action=>"index"

  map.resources :bugs do |bug|
    bug.resources :favorites
    bug.resources :comments,:controller=>"bug_comments",:collection=>{:newest=>:get}
  end

  # ----------------- 验证码 -------------------

  map.simple_captcha '/simple_captcha/:action', :controller => 'simple_captcha'
  map.connect "/js_tests/:page",:controller=>"js_tests",:action=>"index"
  #----------------开发测试页面-------------------
  map.dev_test "/dev_test",:controller=>"dev_test",:action=>"index"
  #----------------git 服务-------------------
  map.repo_index "/repositories",:controller=>"repositories",:action=>"index",:conditions=>{:method=>:get}
  map.create_repo "/repositories",:controller=>"repositories",:action=>"create",:conditions=>{:method=>:post}
  map.new_repo "/repositories/new",:controller=>"repositories",:action=>"new",:conditions=>{:method=>:get}
  map.show_repo "/repositories/:repo_name",:controller=>"repositories",:action=>"show",:conditions=>{:method=>:get}
  map.commit_repo "/repositories/:repo_name",:controller=>"repositories",:action=>"commit",:conditions=>{:method=>:post}
  map.add_repo_file "/repositories/:repo_name/add_file_form",:controller=>"repositories",:action=>"add_file_form",:conditions=>{:method=>:get}
  # 一个文件的显示页面
  map.show_repo_file "/users/:user_id/:repo_name/blob/:commit_id/*path",:controller=>"repositories",:action=>"show_file",:conditions=>{:method=>:get}
  # 文件的raw地址（下载地址）
  map.raw_repo_file "/users/:user_id/:repo_name/raw/:commit_id/*path",:controller=>"repositories",:action=>"raw_file",:conditions=>{:method=>:get}
  # 文件的历史记录
  map.commits_file "/users/:user_id/:repo_name/commits/master/*path",:controller=>"repositories",:action=>"commits_file",:conditions=>{:method=>:get}
end
