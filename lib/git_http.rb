# 通过平台工程对 RepositoryService 发起 http 请求调用的代理类
class GitHttp

  HOST = URI.parse(REPOSITORY_SERVICE_SITE).host
  PORT = URI.parse(REPOSITORY_SERVICE_SITE).port

  include DispatchHttp
  def initialize(user,request)
    @user = user
    @req = request
  end

  def get_repositories
    response = dispatch_http(HOST,"/users/#{@user.id}/repositories.xml",PORT,@req,:get)
    repository_infos = Hash.from_xml(response.body)["repository_infos"]
    repository_infos.blank? ? [] : repository_infos.map{|re|RepositoryInfo.new(re)}
  end

  def create_repository
    path = "/users/#{@user.id}/repositories"
    response = dispatch_http(HOST,path,PORT,@req,:post)
    return false if !reponse_ok?(response)
    RepositoryInfo.new(Hash.from_xml(response.body)["repositoryinfo"])
  end

  def get_repository_files(repo_name)
    response = dispatch_http(HOST,"/users/#{@user.id}/repositories/#{repo_name}",PORT,@req,:get)
    repository_file_infos = Hash.from_xml(response.body)["repository_file_infos"]
    repository_file_infos.blank? ? [] : repository_file_infos.map{|rfi| RepositoryFileInfo.new(rfi)}
  end

  def commit_file_to_repository(repo_name)
    response = dispatch_http(HOST,"/users/#{@user.id}/repositories/#{repo_name}",PORT,@req,:post)
    return reponse_ok?(response)
  end

  def show_file(repo_name,file_name)
    response = dispatch_http(HOST,"/users/#{@user.id}/repositories/#{repo_name}/#{file_name}",PORT,@req,:get)
    return response.body
  end

  def reponse_ok?(response)
    if response.instance_of?(Net::HTTPOK) || response.instance_of?(Net::HTTPSuccess)
      return true
    end
    false
  end

end
