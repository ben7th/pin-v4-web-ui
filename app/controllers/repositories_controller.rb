class RepositoriesController < ApplicationController
  before_filter :per_load
  def per_load
    @git_http = GitHttp.new(current_user,request)
  end

  def index
    @repositories = @git_http.get_repositories
  end

  def new
    render_ui do |ui|
      ui.fbox :show,:title=>"创建版本库",:partial=>"repositories/new"
    end
  end

  def create
    render_ui do |ui|
      @info = @git_http.create_repository
      if @info
        ui.fbox :close
        ui.mplist :insert,{:ul=>"#mplist_repository_infos",:model=>@info},:partial=>"/repositories/parts/info_repository",:locals=>{:repository=>@info}
      else
        flash.now[:error] = "名称已存在"
        ui.fbox :show,:title=>"创建版本库",:partial=>"repositories/new"
      end
    end
  end

  def show
    repo_name = params[:repo_name]
    @repository_file_infos = @git_http.get_repository_files(repo_name)
  end

  def add_file_form
    render_ui do |ui|
      ui.fbox :show,:title=>"添加文件",:partial=>"/repositories/add_file_form"
    end
  end

  def commit
    repo_name = params[:repo_name]
    if @git_http.commit_file_to_repository(repo_name)
      return redirect_to :action=>:show,:repo_name=>repo_name
    end
    render :action=>:add_file_form
  end

  def show_file
    p '--------------------show_file----------------'
    p params
  end

  def raw_file
    p "---------------------raw_file-------------------"
    p params
  end

  def commits_file
    p "---------------------commits_file-------------------"
    p params
  end

end