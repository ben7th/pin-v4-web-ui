class WorkBoardAddMetal < BaseMetal
  def self.routes
    {:method=>'POST',:regexp=>/^\/users\/(.+)\/work_board\/add/}
  end

  def self.deal(hash)
    url_match = hash[:url_match]
    user_id = url_match[1]
    env = hash[:env]
    params = Rack::Request.new(env).params
    wb = WorkBoard.find_or_create_by_user_id(user_id)
    hash = params[:entry] || params["entry"]
    hash = convert_strkey_to_symkey(hash)
    hash = process_special_multipart(hash)
    if wb.add(hash)
      return [200, {"Content-Type" => "text/javascript"}, ["alert('操作成功')"]]
    end
    return [500, {"Content-Type" => "text/javascript"}, ["alert('操作失败，暂存区已满')"]]
  end

  def self.convert_strkey_to_symkey(hash)
    self.strkey_hash_to_symkey_hash(hash)
  end

  def self.strkey_hash_to_symkey_hash(hash)
    new_hash = {}
    hash.each do |key,value|
      new_value = value
      if value.class == Hash
        new_value = strkey_hash_to_symkey_hash(value)
      end
      new_hash[key.to_sym] = new_value
    end
    new_hash
  end

  # 当 上传文件时 Rack::Request.new(env).params 的结构 有些特殊
  # 比如 表单 的内容是{:content=>file}
  # Rack::Request.new(env).params 会变成 {:content=>{:tempfile=>file,:head=>"xx",:type=>"yy"}}
  def self.process_special_multipart(hash)
    if hash[:resource_meta] && hash[:resource_meta][:type] == "FileEntry"
      file = hash[:resource_meta][:data][:content][:tempfile]
      hash[:resource_meta][:data][:content] = file
    end
    hash
  end
end
