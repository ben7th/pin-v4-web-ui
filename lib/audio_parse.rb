class AudioParse
  def self.url_type(url)
    self.get_res(url)["Content-Type"]
  end

  def self.get_res(url)
    curl = URI.parse(url)
    req = Net::HTTP::Get.new(curl.path)
    res = Net::HTTP.start(curl.host,curl.port){|http|
      http.request(req)
    }
    res
  end

  def self.is_audio_url?(url)
    !!self.url_type(url).match("audio")
  end
end