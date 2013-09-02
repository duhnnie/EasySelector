require 'rubygems'

task :required do
    puts "Checking GEMs required..."
    isOk = true
    begin
        require 'json'
    rescue LoadError
        puts "JSON gem not found.\nInstall it by running 'gem install json'"
        isOk = false
    end
    begin
        require 'closure-compiler'
    rescue LoadError
        puts "closure-compiler gem not found.\nInstall it by running 'gem install closure-compiler'"
        isOk = false
    end
    begin
        require 'zip/zip'
        require 'zip/zipfilesystem'
        require 'find'
        require 'fileutils'
    rescue LoadError
        puts "Zip Tools not found.\nInstall it by running 'gem install rubyzip'"
        isOk = false
    end
    begin
        require 'pathname'
    rescue LoadError
        puts "The pathname package can't be found/loaded"
        isOk = false
    end
    if !isOk
        exit
    end
    puts "DONE"
end

task :dir do 
    system 'rm -rf build'
    system 'rm -rf dist'
    Dir.mkdir('dist/') unless File.exists?('dist/')
    Dir.mkdir('build/') unless File.exists?('build/')
    Dir.mkdir('build/css/') unless File.exists?('build/css/')
end

task :css do
    #css_file = File.read 'config/css.json'
    #css_conf = JSON.parse(css_file)
    #css_conf.each do |conf|
    #    file_name = conf["name"].gsub('##PROJECT_NAME##', getProjectName)
    #    file_name = file_name.gsub('##VERSION##', getVersion)
    #    system 'cp ' + conf["file"] + ' ' + 'dist/' + file_name
    #    system 'cp ' + 'dist/' + file_name + ' ' + 'build/css/'
    #end
    #puts "DONE"
end

task :styles do
    puts "Generating stylesheets ..."
    system "compass compile"
    css_file = File.read 'config/css.json'
    css_conf = JSON.parse(css_file)
    css_conf.each do |conf|
        file_name = conf["name"].gsub('##PROJECT_NAME##', getProjectName)
        file_name = file_name.gsub('##VERSION##', getVersion)
        dir = Pathname.new(conf["file"]).dirname.to_s
        system 'mv ' + conf["file"] + ' ' + dir + "/" + file_name
        system 'cp ' + dir + "/" + file_name + ' ' + 'dist/' + file_name
    end
    puts "DONE" 
end

task :js => :required do
    build_file = File.read 'config/build.json'
    sources = JSON.parse(build_file)
    sources.each do |source|
        extension = source['target_ext']
        file_name = source['name'].gsub('##PROJECT_NAME##', getProjectName)
        file_name = file_name.gsub('##VERSION##', getVersion) + "." + extension
        puts "Generating: " + file_name + " ..."
        file_name_min = file_name + ".min." + extension
        writePath = source['target_path']
        files = source['files']
        buffer = ""
        files.each do |file|
            rFile = file
            puts rFile
            data = File.read rFile
            if data
                buffer += data
                buffer += "\n"
            end
        end
        Dir.mkdir(writePath) unless File.exists?(writePath)
        File.open(writePath + file_name, 'w+') do |file_write|
            file_write.write buffer
        end
        File.open(writePath + file_name_min, 'w+') do |file_write_min|
            file_write_min.write Closure::Compiler.new.compress(buffer)
        end
        puts "DONE"
    end
end

task :demo do
    html = File.read 'src/demo/index.html'
    html['##VERSION##'] = getVersion
    html['##PROJECT_NAME##'] = getProjectName
    html['##VERSION##'] = getVersion
    html['##PROJECT_NAME##'] = getProjectName
    html['##PROJECT_NAME##'] = getProjectName
    html['##VERSION##'] = getVersion
    File.open("build/index.html", 'w+') do |file|
        file.write html
    end
    system 'cp src/demo/app.js build/js/app.js'
    system 'cp -r src/demo/lib build/.'
    system 'cp -r src/img build/.'
end

desc "Build EasySelector"
task :build do |t, args|
  Rake::Task['required'].execute
  Rake::Task['dir'].execute 
  Rake::Task['styles'].execute
  Rake::Task['css'].execute
  Rake::Task['js'].execute
  Rake::Task['demo'].execute
  #Rake::Task['package'].execute
  puts "Project has been build correctly."
end

task :package do
    zip_config = File.read 'config/dist.json'
    zipconfig = JSON.parse(zip_config)
    zip_path = zipconfig['target_path']
    fileName = zipconfig['name']
    fileName += '-' + getVersion + '.zip'
    FileUtils.rm zip_path + fileName, :force=>true
    Dir.mkdir(zip_path) unless File.exists?(zip_path)
    Zipper.zip(zipconfig['folder'], zip_path + fileName)
    puts "File: " + fileName + " has been created correctly!"
end

desc "Set the library's version"
task :version, :version do |t,args|
  if (args['version'])
    File.open('VERSION.txt', 'w+') do |file|
      file.write args['version']
    end
  end
end

def getVersion
    version = File.read 'VERSION.txt'
    return version
    exit
end

def getProjectName
    appname = File.read 'PROJECT_NAME.txt'
    return appname
    exit
end

task :default do
    Rake::Task['build'].execute
end