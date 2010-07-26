class CreateAllTables < ActiveRecord::Migration
  def self.up
    create_table "answer_selections", :force => true do |t|
      t.integer  "question_option_id"
      t.integer  "question_answer_id"
      t.string   "content"
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :answer_selections,:question_option_id
    add_index :answer_selections,:question_answer_id

    create_table "attentions", :force => true do |t|
      t.integer  "user_id"
      t.integer  "resource_entry_id"
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :attentions,:user_id
    add_index :attentions,:resource_entry_id

    create_table "combo_links", :force => true do |t|
      t.integer  "tag_id",       :null => false
      t.integer  "tag_combo_id", :null => false
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :combo_links,:tag_id
    add_index :combo_links,:tag_combo_id

    create_table "constraints", :force => true do |t|
      t.integer  "task_id",                     :null => false
      t.string   "requirement", :default => "", :null => false
      t.string   "status",      :default => ""
      t.datetime "time_point"
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :constraints,:task_id

    create_table "executions", :force => true do |t|
      t.text     "content",    :null => false
      t.integer  "user_id",    :null => false
      t.integer  "task_id",    :null => false
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :executions,:user_id
    add_index :executions,:task_id

    create_table "file_entries", :force => true do |t|
      t.string   "title"
      t.string   "content_file_name"
      t.string   "content_content_type"
      t.integer  "content_file_size"
      t.datetime "created_at"
      t.datetime "updated_at"
    end

    create_table "folders", :force => true do |t|
      t.string   "title",           :default => "",       :null => false
      t.integer  "creator_id",                            :null => false
      t.string   "status",          :default => "PUBLIC"
      t.string   "hashed_password"
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :folders,:creator_id

    create_table "group_bundles", :force => true do |t|
      t.string   "type"
      t.integer  "parent_id",                   :null => false
      t.string   "parent_type", :default => "", :null => false
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index "group_bundles", ["parent_id", "parent_type"], :name => "index_group_bundles_on_parent_id_and_parent_type"

    create_table "groups", :force => true do |t|
      t.string   "name",            :default => "",     :null => false
      t.boolean  "hidden",          :default => false
      t.string   "approve_level",   :default => "FREE"
      t.string   "type"
      t.string   "status"
      t.text     "subject"
      t.integer  "creator_id"
      t.integer  "group_bundle_id"
      t.integer  "task_id"
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :groups,:creator_id
    add_index :groups,:group_bundle_id
    add_index :groups,:task_id

    create_table "link_entries", :force => true do |t|
      t.integer  "user_id",           :null => false
      t.integer  "resource_entry_id", :null => false
      t.text     "serialization"
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :link_entries,:user_id
    add_index :link_entries,:resource_entry_id

    create_table "memberships", :force => true do |t|
      t.integer  "user_id",                           :null => false
      t.integer  "group_id",                          :null => false
      t.string   "status",     :default => "APPROVE"
      t.string   "role"
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :memberships,:user_id
    add_index :memberships,:group_id

    create_table "message_readings", :force => true do |t|
      t.integer  "message_topic_id",                    :null => false
      t.integer  "receiver_id",                         :null => false
      t.integer  "unread_count",     :default => 1
      t.boolean  "hidden",           :default => false
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :message_readings,:message_topic_id
    add_index :message_readings,:receiver_id

    create_table "message_topics", :force => true do |t|
      t.datetime "created_at"
      t.datetime "updated_at"
    end

    create_table "messages", :force => true do |t|
      t.integer  "sender_id",                           :null => false
      t.integer  "message_topic_id",                    :null => false
      t.string   "content",          :default => "",    :null => false
      t.boolean  "hidden",           :default => false
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :messages,:sender_id
    add_index :messages,:message_topic_id


    create_table "online_records", :force => true do |t|
      t.integer  "user_id"
      t.string   "key"
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index "online_records", ["key"], :name => "index_online_records_on_key"
    add_index "online_records", ["user_id"], :name => "index_online_records_on_user_id"

    create_table "operations", :force => true do |t|
      t.integer  "user_id",                     :null => false
      t.integer  "at_id"
      t.string   "at_type"
      t.string   "action",      :default => "", :null => false
      t.integer  "target_id"
      t.string   "target_type"
      t.string   "target_name"
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :operations,:user_id
    add_index :operations,[:at_id,:at_type]
    add_index :operations,[:target_id,:target_type]

    create_table "posts", :force => true do |t|
      t.string   "content",    :default => "", :null => false
      t.integer  "user_id",                    :null => false
      t.integer  "topic_id",                   :null => false
      t.datetime "created_at"
      t.datetime "updated_at"
      t.string   "status",     :default => ""
    end
    add_index :posts,:user_id
    add_index :posts,:topic_id

    create_table "preferences", :force => true do |t|
      t.integer  "user_id",                          :null => false
      t.boolean  "auto_popup_msg", :default => true
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :preferences,:user_id

    create_table "question_answers", :force => true do |t|
      t.integer  "question_id"
      t.integer  "survey_result_id"
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :question_answers,:question_id
    add_index :question_answers,:survey_result_id

    create_table "question_options", :force => true do |t|
      t.string   "title"
      t.integer  "question_id"
      t.string   "kind"
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :question_options,:question_id

    create_table "questions", :force => true do |t|
      t.string   "title"
      t.integer  "survey_id"
      t.string   "kind",       :default => "SINGLE"
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :questions,:survey_id

    create_table "quotings", :force => true do |t|
      t.integer  "container_id",                     :null => false
      t.integer  "resource_entry_id",                :null => false
      t.integer  "position"
      t.string   "container_type"
      t.integer  "nesting_level",     :default => 0
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :quotings,:container_id
    add_index :quotings,:resource_entry_id

    create_table "readings", :force => true do |t|
      t.integer  "resource_entry_id", :null => false
      t.integer  "user_id",           :null => false
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :readings,:resource_entry_id

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
    end
    add_index :remarks,:creator_id
    add_index :remarks,[:markable_id,:markable_type]

    create_table "resource_entries", :force => true do |t|
      t.integer  "user_id"
      t.integer  "resource_id"
      t.string   "resource_type"
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :resource_entries,:user_id
    add_index :resource_entries,[:resource_id,:resource_type]

    create_table "roles", :force => true do |t|
      t.string "name", :default => "", :null => false
    end
    add_index :roles,:name

    create_table "rss_entries", :force => true do |t|
      t.string   "title",      :default => "", :null => false
      t.string   "url"
      t.text     "yaml"
      t.datetime "created_at"
      t.datetime "updated_at"
    end

    create_table "structures", :force => true do |t|
      t.integer  "container_id",                   :null => false
      t.string   "container_type", :default => "", :null => false
      t.text     "map",                            :null => false
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :structures,[:container_id,:container_type]

    create_table "survey_results", :force => true do |t|
      t.integer  "survey_id"
      t.integer  "user_id"
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :survey_results,:survey_id
    add_index :survey_results,:user_id

    create_table "surveys", :force => true do |t|
      t.string   "title"
      t.boolean  "published",  :default => false
      t.string   "type"
      t.integer  "post_id"
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :surveys,:post_id

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
    add_index :tag_combos,:creator_id

    create_table "taggings", :force => true do |t|
      t.integer  "tag_id"
      t.integer  "taggable_id"
      t.string   "taggable_type"
      t.integer  "user_id",       :null => false
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :taggings,:tag_id
    add_index :taggings,[:taggable_id,:taggable_type]
    add_index :taggings,:user_id

    create_table "tags", :force => true do |t|
      t.string   "value"
      t.datetime "created_at"
      t.datetime "updated_at"
    end

    create_table "task_allocations", :force => true do |t|
      t.integer  "task_id",                    :null => false
      t.integer  "user_id",                    :null => false
      t.string   "status",     :default => ""
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :task_allocations,:task_id
    add_index :task_allocations,:user_id

    create_table "tasks", :force => true do |t|
      t.string   "title",      :default => "", :null => false
      t.text     "content",                    :null => false
      t.integer  "user_id",                    :null => false
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :tasks,:user_id

    create_table "text_entries", :force => true do |t|
      t.text     "content",    :null => false
      t.string   "title"
      t.datetime "created_at"
      t.datetime "updated_at"
    end

    create_table "todos", :force => true do |t|
      t.text     "content",    :null => false
      t.integer  "user_id",    :null => false
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :todos,:user_id

    create_table "topics", :force => true do |t|
      t.string   "title",      :default => "",       :null => false
      t.string   "content",    :default => "",       :null => false
      t.integer  "user_id",                          :null => false
      t.integer  "host_id",                          :null => false
      t.string   "host_type"
      t.string   "kind",       :default => "NORMAL"
      t.string   "status",     :default => ""
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :topics,:user_id
    add_index :topics,[:host_id,:host_type]

    create_table "user_roles", :force => true do |t|
      t.integer "user_id", :null => false
      t.integer "role_id", :null => false
    end
    add_index "user_roles", ["role_id"], :name => "index_user_roles_on_role_id"
    add_index "user_roles", ["user_id"], :name => "index_user_roles_on_user_id"

    create_table "users", :force => true do |t|
      t.string   "login",             :default => "", :null => false
      t.string   "name",              :default => "", :null => false
      t.string   "hashed_password",   :default => "", :null => false
      t.string   "salt",              :default => "", :null => false
      t.string   "email",             :default => "", :null => false
      t.string   "sign"
      t.string   "active_code"
      t.boolean  "activated",                         :null => false
      t.string   "logo_file_name"
      t.string   "logo_content_type"
      t.integer  "logo_file_size"
      t.datetime "logo_updated_at"
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index "users", ["login"], :name => "index_users_on_login"

    create_table "versions", :force => true do |t|
      t.integer  "user_id",                       :null => false
      t.string   "version_name"
      t.integer  "version",                       :null => false
      t.integer  "source_id",                     :null => false
      t.string   "source_type",   :default => "", :null => false
      t.text     "serialization",                 :null => false
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    add_index :versions,:user_id
    add_index :versions,[:source_id,:source_type]

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
  end

  def self.down
  end
end
