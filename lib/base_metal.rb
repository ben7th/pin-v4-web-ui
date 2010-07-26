require(File.dirname(__FILE__) + "/../../config/environment") unless defined?(Rails)

class BaseMetal
  def self.call(env)
    self.fix_path_info(env)
    begin
      self.check_routes(env)
    rescue Exception => ex
      self.request_error
    end
  end

  def self.fix_path_info(env)
    env["PATH_INFO"], env["QUERY_STRING"] = env["REQUEST_URI"].split(/\?/, 2)
  end

  def self.check_routes(env)
    routes_match = self.routes_match(env)
    if routes_match
      return self.process_request(:env=>env,:url_match=>routes_match)
    end
    self.request_pass
  end

  def self.process_request(hash)
    self.deal(hash)
  ensure
    ActiveRecord::Base.clear_active_connections!
  end

  def self.routes_match(env)
    routes = self.routes
    method = routes[:method]
    regexp = routes[:regexp]
    match = env["REQUEST_URI"].match(regexp)
    method_match = env['REQUEST_METHOD'] == method
    
    return match if match && method_match
    return false
  end

  def self.routes_regexp
  end

  def self.request_pass
    [404, {"Content-Type" => "text/html"}, ["Not Found"]]
  end

  def self.request_error
    [500, {"Content-Type" => "text/html"}, ["Error"]]
  end

end
