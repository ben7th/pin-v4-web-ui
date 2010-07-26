# This file is auto-generated from the current state of the database. Instead of editing this file, 
# please use the migrations feature of Active Record to incrementally modify your database, and
# then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your database schema. If you need
# to create the application database on another system, you should be using db:schema:load, not running
# all the migrations from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20100712071010) do

  create_table "achievements", :force => true do |t|
    t.integer  "user_id"
    t.string   "honor"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "achievements", ["honor"], :name => "index_achievementings_on_achievement_id"
  add_index "achievements", ["user_id"], :name => "index_achievementings_on_user_id"

  create_table "apps", :force => true do |t|
    t.string   "name"
    t.string   "title"
    t.string   "callback_url"
    t.integer  "port",              :default => 80
    t.string   "secret_key"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "logo_file_name"
    t.string   "logo_content_type"
    t.integer  "logo_file_size"
    t.datetime "logo_updated_at"
    t.string   "developer"
    t.text     "subject"
  end

  add_index "apps", ["name"], :name => "index_apps_on_name"

  create_table "bookmark_entries", :force => true do |t|
    t.string   "url"
    t.string   "site"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "title"
    t.text     "snapshot"
    t.string   "image_src"
    t.string   "video_src"
  end

  create_table "bugs", :force => true do |t|
    t.string   "kind"
    t.string   "content"
    t.integer  "user_id"
    t.string   "user_ip"
    t.string   "attachment_file_name"
    t.string   "attachment_content_type"
    t.integer  "attachment_file_size"
    t.datetime "attachment_updated_at"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "handled",                 :default => false
    t.boolean  "closed",                  :default => false
    t.string   "user_agent"
  end

  create_table "combo_links", :force => true do |t|
    t.integer  "tag_id",       :null => false
    t.integer  "tag_combo_id", :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "combo_links", ["tag_combo_id"], :name => "index_combo_links_on_tag_combo_id"
  add_index "combo_links", ["tag_id"], :name => "index_combo_links_on_tag_id"

  create_table "contactings", :force => true do |t|
    t.integer  "host_id"
    t.integer  "contact_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "show_share"
  end

  add_index "contactings", ["contact_id"], :name => "index_contacts_on_friend_id"
  add_index "contactings", ["host_id"], :name => "index_contacts_on_host_id"

  create_table "entries", :force => true do |t|
    t.integer  "user_id"
    t.integer  "resource_id"
    t.string   "resource_type"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "deleted_at"
    t.integer  "host_id"
    t.string   "host_type"
    t.string   "from"
    t.boolean  "forbidden"
  end

  add_index "entries", ["resource_id", "resource_type"], :name => "index_resource_entries_on_resource_id_and_resource_type"
  add_index "entries", ["user_id"], :name => "index_resource_entries_on_user_id"

  create_table "favorites", :force => true do |t|
    t.integer  "favorable_id"
    t.string   "favorable_type"
    t.integer  "user_id"
    t.integer  "num"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "feelings", :force => true do |t|
    t.integer  "feelable_id"
    t.string   "feelable_type"
    t.integer  "user_id"
    t.string   "evaluation"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "file_entries", :force => true do |t|
    t.string   "title"
    t.string   "content_file_name"
    t.string   "content_content_type"
    t.integer  "content_file_size"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "subject"
    t.string   "detail"
  end

  create_table "installings", :force => true do |t|
    t.integer  "user_id"
    t.integer  "app_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "is_default"
    t.boolean  "usually_used"
  end

  add_index "installings", ["app_id"], :name => "index_installings_on_app_id"
  add_index "installings", ["user_id"], :name => "index_installings_on_user_id"

  create_table "introductions", :force => true do |t|
    t.integer  "user_id"
    t.integer  "introductable_id"
    t.boolean  "checked"
    t.text     "content"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "introductable_type"
  end

  create_table "invitations", :force => true do |t|
    t.integer  "host_id"
    t.string   "contact_email"
    t.string   "uuid"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "invitations", ["host_id"], :name => "index_invitations_on_host_id"

  create_table "message_modelings", :force => true do |t|
    t.integer  "model_id",                   :null => false
    t.string   "model_type", :default => "", :null => false
    t.integer  "message_id",                 :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "message_readings", :force => true do |t|
    t.integer  "receiver_id",                     :null => false
    t.integer  "unread_count", :default => 1
    t.boolean  "hidden",       :default => false, :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "unread",       :default => true
    t.integer  "message_id",                      :null => false
  end

  add_index "message_readings", ["receiver_id"], :name => "index_message_readings_on_receiver_id"

  create_table "messages", :force => true do |t|
    t.integer  "creator_id",                          :null => false
    t.text     "content",                             :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "title",      :default => "",          :null => false
    t.boolean  "draft",      :default => false
    t.string   "uuid"
    t.string   "namespace",  :default => "site_mail"
    t.integer  "parent_id"
    t.integer  "lft"
    t.integer  "rgt"
  end

  add_index "messages", ["creator_id"], :name => "index_messages_on_sender_id"

  create_table "online_records", :force => true do |t|
    t.integer  "user_id"
    t.string   "key"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "online_records", ["key"], :name => "index_online_records_on_key"
  add_index "online_records", ["user_id"], :name => "index_online_records_on_user_id"

  create_table "participatings", :force => true do |t|
    t.integer  "message_id", :null => false
    t.integer  "user_id",    :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "participatings", ["message_id"], :name => "index_participatings_on_message_id"
  add_index "participatings", ["user_id"], :name => "index_participatings_on_user_id"

  create_table "preferences", :force => true do |t|
    t.integer  "user_id",                          :null => false
    t.boolean  "auto_popup_msg", :default => true
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "show_tooltip",   :default => true
    t.string   "theme"
  end

  add_index "preferences", ["user_id"], :name => "index_preferences_on_user_id"

  create_table "readings", :force => true do |t|
    t.integer  "readable_id",   :null => false
    t.integer  "user_id",       :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "readable_type"
  end

  add_index "readings", ["readable_id"], :name => "index_readings_on_resource_entry_id"

  create_table "remark_rates", :force => true do |t|
    t.integer  "user_id",                       :null => false
    t.integer  "rateable_id",                   :null => false
    t.string   "rateable_type", :default => "", :null => false
    t.integer  "rate"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "remarks", :force => true do |t|
    t.text     "content",                          :null => false
    t.integer  "creator_id",                       :null => false
    t.integer  "markable_id",                      :null => false
    t.string   "markable_type",    :default => "", :null => false
    t.string   "symbol"
    t.integer  "version"
    t.integer  "to"
    t.integer  "from"
    t.integer  "paragraph_number"
    t.integer  "at"
    t.string   "type"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float    "left"
    t.float    "top"
    t.float    "width"
    t.float    "height"
    t.integer  "reply_to"
  end

  add_index "remarks", ["creator_id"], :name => "index_remarks_on_creator_id"
  add_index "remarks", ["markable_id", "markable_type"], :name => "index_remarks_on_markable_id_and_markable_type"

  create_table "reports", :force => true do |t|
    t.integer  "reportable_id"
    t.text     "content"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "creator_id"
    t.string   "reason"
    t.boolean  "handled"
    t.string   "reportable_type"
  end

  add_index "reports", ["creator_id"], :name => "index_reports_on_creator_id"
  add_index "reports", ["reportable_id"], :name => "index_reports_on_entry_id"

  create_table "requirements", :force => true do |t|
    t.integer  "host_id",                    :null => false
    t.string   "kind",       :default => "", :null => false
    t.datetime "time_point"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "subject"
    t.string   "host_type"
  end

  add_index "requirements", ["host_id"], :name => "index_constraints_on_task_id"

  create_table "roles", :force => true do |t|
    t.string "name", :default => "", :null => false
  end

  add_index "roles", ["name"], :name => "index_roles_on_name"

  create_table "rss_feeds", :force => true do |t|
    t.string   "title"
    t.string   "source"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "description"
    t.string   "claim_code"
    t.integer  "user_id"
  end

  create_table "rss_items", :force => true do |t|
    t.string   "title"
    t.string   "link"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "rss_feed_id"
    t.string   "author"
    t.datetime "pub_date"
    t.string   "img_url"
  end

  create_table "shares", :force => true do |t|
    t.integer  "shareable_id"
    t.integer  "creator_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "shareable_type"
    t.text     "content"
    t.string   "kind",            :default => "TALK"
    t.integer  "last_forward_id"
    t.integer  "entry_id"
  end

  add_index "shares", ["creator_id"], :name => "index_shares_on_creator_id"
  add_index "shares", ["shareable_id"], :name => "index_shares_on_entry_id"

  create_table "short_urls", :force => true do |t|
    t.string   "url"
    t.string   "code"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "simple_captcha_data", :force => true do |t|
    t.string   "key",        :limit => 40
    t.string   "value",      :limit => 6
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "subscription_entries", :force => true do |t|
    t.integer  "user_id"
    t.integer  "rss_feed_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "subscription_entries", ["rss_feed_id"], :name => "index_subscription_entries_on_rss_feed_id"
  add_index "subscription_entries", ["user_id"], :name => "index_subscription_entries_on_user_id"

  create_table "system_settings", :force => true do |t|
    t.string   "name"
    t.text     "footer_info"
    t.text     "login_info"
    t.string   "logo_file_name"
    t.string   "logo_content_type"
    t.integer  "logo_file_size"
    t.datetime "logo_updated_at"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "tag_combos", :force => true do |t|
    t.string   "name",       :default => "", :null => false
    t.integer  "creator_id",                 :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "tag_combos", ["creator_id"], :name => "index_tag_combos_on_creator_id"

  create_table "taggings", :force => true do |t|
    t.integer  "tag_id"
    t.integer  "taggable_id"
    t.string   "taggable_type"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "taggings", ["tag_id"], :name => "index_taggings_on_tag_id"
  add_index "taggings", ["taggable_id", "taggable_type"], :name => "index_taggings_on_taggable_id_and_taggable_type"

  create_table "tags", :force => true do |t|
    t.string   "value"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "user_id",    :null => false
  end

  create_table "text_entries", :force => true do |t|
    t.text     "content",                   :null => false
    t.string   "title"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "length",     :default => 0
  end

  create_table "user_roles", :force => true do |t|
    t.integer "user_id", :null => false
    t.integer "role_id", :null => false
  end

  add_index "user_roles", ["role_id"], :name => "index_user_roles_on_role_id"
  add_index "user_roles", ["user_id"], :name => "index_user_roles_on_user_id"

  create_table "users", :force => true do |t|
    t.string   "name",                      :default => "", :null => false
    t.string   "hashed_password",           :default => "", :null => false
    t.string   "salt",                      :default => "", :null => false
    t.string   "email",                     :default => "", :null => false
    t.string   "sign"
    t.string   "activation_code"
    t.string   "logo_file_name"
    t.string   "logo_content_type"
    t.integer  "logo_file_size"
    t.datetime "logo_updated_at"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "activated_at"
    t.string   "reset_password_code"
    t.datetime "reset_password_code_until"
    t.boolean  "v09"
    t.boolean  "v09_up"
    t.datetime "last_login_time"
  end

  create_table "usings", :force => true do |t|
    t.integer  "share_id"
    t.integer  "entry_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "usings", ["entry_id"], :name => "index_usings_on_entry_id"
  add_index "usings", ["share_id"], :name => "index_usings_on_share_id"

  create_table "view_records", :force => true do |t|
    t.integer  "user_id",                     :null => false
    t.integer  "source_id",                   :null => false
    t.string   "source_type", :default => "", :null => false
    t.integer  "views",       :default => 0
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "view_records", ["source_id", "source_type"], :name => "index_view_records_on_source_id_and_source_type"
  add_index "view_records", ["user_id"], :name => "index_view_records_on_user_id"

  create_table "web_sites", :force => true do |t|
    t.string   "domain"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "page_rank"
    t.string   "title"
    t.string   "key_words"
    t.string   "description"
  end

  create_table "work_board_quotings", :force => true do |t|
    t.integer  "work_board_id"
    t.integer  "entry_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "work_boards", :force => true do |t|
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
