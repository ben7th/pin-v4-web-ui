module EtagGenerator

  # 这个module用来获取HTTP缓存所使用的的Etag
  # 将来如果获取方法改变，比如从memcache里面取得Etag时，可以修改这里作统一调整
  # 方法命名规则：
  # <某类>的etag：   xxxs_etag
  # <某对象>的<某关联对象>的etag：
  #   aaa_bbbs_etag   (has_many时)
  #   aaa_bbb_etag   (has_one时)

  def autocomplete_http_etag(str)
    fetch_etag(User.str_to_autocomplete_http_cache_key(str))
  end

  def user_text_resource_entries_etag(user)
    fetch_etag("user_#{user.id}_text_resource_entries_etag")
  end

  def taggings_etag
    fetch_etag("taggings_etag")
  end

  def user_taggings_etag(user)
    fetch_etag("user_#{user.id}_taggings_etag")
  end

  def user_file_resource_entries_etag(user)
    fetch_etag("user_#{user.id}_file_resource_entries_etag")
  end

  def message_message_readings_etag(message)
    fetch_etag("message_#{message.id}_message_readings_etag")
  end

  def fetch_etag(key)
    [Rails.cache.fetch(key){
        Time.now
      },etag_version]
  end

  # 每次更新程序后修改这里，用于强制HTTP缓存更新
  def etag_version
    1
  end
    
end
