class GitRepository

  GIT_BIN = "#{GIT_BIN_PATH}/git"

  def initialize(hash)
    @user = hash[:user] || User.find(hash[:user_id])
    if !@user.instance_of?(User)
      raise ":user 必须是 User 对象"
    end
    @name = hash[:repo_name]
    GitRepository.init_user_path(@user)
  end

  # 找到某个版本库
  def self.find(user_id,repo_name)
    path = self.repository_path(user_id,repo_name)
    return nil if !File.exist?(path)
    gr = GitRepository.new(:user_id=>user_id,:repo_name=>repo_name)
    gr.instance_variable_set(:@is_find, true)
    gr
  end

  # 初始化 用户用到的 所有地址
  def self.init_user_path(user)
    self.init_user_repository_path(user)
    self.init_user_recycle_path(user)
  end

  # 初始化 用户的 版本库 根地址
  def self.init_user_repository_path(user)
    path = self.user_repository_path(user.id)
    FileUtils.mkdir_p(path) if !File.exist?(path)
  end

  # 初始化 用户的 回收站 地址
  def self.init_user_recycle_path(user)
    path = self.user_recycle_path(user.id)
    FileUtils.mkdir_p(path) if !File.exist?(path)
  end

  # 用户的 版本库 根地址
  def self.user_repository_path(user_id)
    "#{GIT_REPO_PATH}/users/#{user_id}"
  end

  # 用户的 回收站 地址
  def self.user_recycle_path(user_id)
    "#{GIT_REPO_PATH}/deleted/users/#{user_id}"
  end

  # 用户 的 某个版本库 地址
  def self.repository_path(user_id,repo_name)
    "#{self.user_repository_path(user_id)}/#{repo_name}"
  end

  # 该 git 版本库 的路径
  def path
    GitRepository.repository_path(@user.id,@name)
  end

  # 判断是否通过验证
  def valid?
    return true if @if_find || @new_create || GitRepository.find(@user.id,@name).nil?
    @errors = {:repo=>"版本库名称已经存在"}
    return false
  end

  # valid? 如果没有通过 ,返回存在的错误
  def errors
    @errors
  end

  # 判断 版本库是否存在
  # 如果不存在 new_record? == true
  def new_record?
    !File.exist?(self.path)
  end

  # 创建一个 git 版本库
  # gr = GitRepository.create(:user=>user,:repo_name=>"版本库名字")
  # 判断是否创建成功 gr.new_record? == false
  def self.create(hash)
    repo = self.new(hash)
    if repo.valid?
      g = Grit::Repo.init(repo.path)
      # git config core.quotepath false
      # core.quotepath设为false的话，就不会对0x80以上的字符进行quote。中文显示正常
      g.config["core.quotepath"] = "false"
      repo.instance_variable_set(:@new_create, true)
    end
    repo
  end

  # 删除一个版本库
  # 其实是把该版本库 放入 回收站 目录
  def destroy
    return false if !File.exist?(path)
    recycle_path = GitRepository.user_recycle_path(@user.id)
    run_cmd "mv #{path} #{recycle_path}/#{@name}_#{randstr}"
    return true
  end

  # 删除版本库里的某个文件
  def delete_file(file_path)
    return false if file_path.blank?
    absolute_file_path = File.join(path,file_path)
    return false if !File.exist?(absolute_file_path)
    Dir.chdir(path) do
      g = Grit::Repo.new(".")
      g.remove(file_path)
      g.commit("remove file #{file_path}")
    end
    return true
  end

  # 返回 版本库 的 提交 log
  def log
    g = Git.open(path)
    log = []
    begin
      g.log.each do |git_commit|
        log << {}.merge(:commit=>git_commit.sha,
          :data=>git_commit.author_date,
          :author_name=>git_commit.author.name,
          :author_email=>git_commit.author.email
        )
      end
      return log
    rescue Exception => ex
      return []
    end
  end

  def randstr(length=8)
    base = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    size = base.size
    re = ''<<base[rand(size-10)]
    (length-1).times  do
      re<<base[rand(size)]
    end
    re
  end

  def self.find_all(user_id)
    user_git = GitRepository.user_repository_path(user_id)
    repositories = []
    begin
      Dir.foreach(user_git) do |file_item|
        if file_item!="."&&file_item!=".."
          repo = self.find(user_id,file_item)
          repositories << repo.info
        end
      end
    rescue Exception => ex
      p ex
    end
    repositories
  end

  def show(sub_path='')
    repository_files = []
    begin
      r = Grit::Repo.new(path)
      r.commits.first.tree.contents.each do |blob|
        first_commit = r.log(blob.name).first
        author = first_commit.author
        repository_files << RepositoryFileInfo.new({:date=>first_commit.authored_date,:author=>author.name,:email=>author.email,:name=>blob.name,:kind=>blob.class.to_s})
      end
    rescue Exception => ex
      p ex
    end
    repository_files
  end

  def add_file(file,sub_path)
    sub_path ||= "./"
    relative_file_path = File.join(sub_path,file[:filename])
    absolute_prefix_path = File.join(path,sub_path)
    absolute_file_path = File.join(path,relative_file_path)
    FileUtils.mkdir_p(absolute_prefix_path)
    FileUtils.cp_r(file[:tempfile].path,absolute_file_path)
    Dir.chdir(path) do
      r = Grit::Repo.new('.')
      r.config['user.name'] = @user.name
      r.config['user.email'] = @user.email
      r.add(relative_file_path)
      r.commit_index("add file #{relative_file_path}")
    end
    return true
  end

  def show_file(file_name)
    return "#{path}/#{file_name}"
  end

  def info
    g = Grit::Repo.new(path)
    begin
      last_commit = g.commits.first
      author = last_commit.author
      RepositoryInfo.new({:date=>last_commit.authored_date,:author=>author.name,:email=>author.email,:name=>@name})
    rescue Exception => ex
      return RepositoryInfo.new(:name=>@name,:author=>@user.name,:email=>@user.email)
    end
  end

end