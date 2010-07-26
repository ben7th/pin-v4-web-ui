module AutoCompeleteCache

  def self.included(base)
    base.send(:extend,ClassMethods)
    base.after_save :exprie_cache
    base.after_destroy :exprie_cache
  end

  def exprie_cache
    if self.name_changed?
      prefixs = self.name.to_prefixs
      prefixs.each do |str|
        key = User.str_to_autocomplete_cache_key(str)
        Rails.cache.delete(key)
        http_key = User.str_to_autocomplete_http_cache_key(str)
        Rails.cache.delete(http_key)
      end
    end
    return true
  end

  def bulid_cache
    user_name_prefixs = self.name.to_prefixs
    user_name_prefixs.each do |str|
      User.fetch_str_cache(str)
    end
  end

  module ClassMethods
    def bulid_all_user_cache
      User.all.each do |user|
        user.bulid_cache
      end
    end

    def fetch_str_cache(str)
      key = User.str_to_autocomplete_cache_key(str)
      Rails.cache.fetch(key){
        User.find(:all,:conditions=>["name like ?","#{str}%"])
      }
    end

    def str_to_autocomplete_cache_key(str)
      "autocomplete/#{str}"
    end

    def str_to_autocomplete_http_cache_key(str)
      "autocomplete_http/#{str}"
    end
  end
end