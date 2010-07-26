require "grit"

module Grit
  class Repo
    def self.init(path)
      # create directory
      git_path = File.join(path, ".git")

      # generate initial git directory
      if !File.exist?(git_path)
        git = Git.new(git_path)
        git.fs_mkdir("")
        git.init({:bare=>false})
      end
      
      # create new Grit::Repo on that dir, return it
      self.new(path,{})
    end

    def log_with_change_dir(commit = 'master', path = nil, options = {})
      Dir.chdir(working_dir) do
        log_without_change_dir(commit, path, options)
      end
    end

    alias_method_chain :log,:change_dir
  end

  # 这个 run 方法 是为了方便调试
  # 重写 run 方法 时，用 p 方法 输出 call 变量
  # 可以 方便 看到 grit api 对应 的 shell 命令
#  class Git
#    def run(prefix, cmd, postfix, options, args)
#      timeout  = options.delete(:timeout) rescue nil
#      timeout  = true if timeout.nil?
#
#      opt_args = transform_options(options)
#
#      if RUBY_PLATFORM.downcase =~ /mswin(?!ce)|mingw|bccwin/
#        ext_args = args.reject { |a| a.empty? }.map { |a| (a == '--' || a[0].chr == '|') ? a : "\"#{e(a)}\"" }
#        call = "#{prefix}#{Git.git_binary} --git-dir=\"#{self.git_dir}\" #{cmd.to_s.gsub(/_/, '-')} #{(opt_args + ext_args).join(' ')}#{e(postfix)}"
#      else
#        ext_args = args.reject { |a| a.empty? }.map { |a| (a == '--' || a[0].chr == '|') ? a : "'#{e(a)}'" }
#        call = "#{prefix}#{Git.git_binary} --git-dir='#{self.git_dir}' #{cmd.to_s.gsub(/_/, '-')} #{(opt_args + ext_args).join(' ')}#{e(postfix)}"
#      end
#
#      p "~~~~git shell~~~~~~~"
#      p call
#      p "~~~~git shell~~~~~~~"
#
#      Grit.log(call) if Grit.debug
#      response, err = timeout ? sh(call) : wild_sh(call)
#      Grit.log(response) if Grit.debug
#      Grit.log(err) if Grit.debug
#      response
#    end
#  end
end