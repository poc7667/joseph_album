require 'pathname'
require 'uri'
require 'pry'
require 'fileutils'

Dir["./**/*"].each do |img|
  if img =~ /.*(jpg|png|gif)$/
    file_path = Pathname.new(img).to_s
    new_file_path =  file_path.gsub(/\s/,'')
    if file_path!=new_file_path
      FileUtils.mv(file_path, new_file_path)
    end
  end
end
