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
    if !isOk
        exit
    end
    puts "DONE"
end

task :removefolders do 
    system 'rm -rf build'
    system 'rm -rf dist'
end

task :js => :compass do
    build_file = File.read 'config/build.json'
    sources = JSON.parse(build_file)
    sources.each do |source|
        extension = source['target_ext']
        puts "Generating: " + source['name'] + '-' + getVersion + "." + extension + " ..."
        fileName = source['name'] + '-' + getVersion + "." + extension
        fileNameMin = source['name'] + '-' + getVersion + ".min." + extension
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
        File.open(writePath + fileName, 'w+') do |file_write|
            file_write.write buffer
        end
        File.open(writePath + fileNameMin, 'w+') do |file_write_min|
            file_write_min.write Closure::Compiler.new.compress(buffer)
        end
        puts "DONE"
    end
end

task :sample do
    html = File.read 'src/sample/index.html'
    html['##VERSION##'] = getVersion
    html['##APP##'] = getAppName
    html['##VERSION##'] = getVersion
    File.open("build/index.html", 'w+') do |file|
        file.write html
    end
    system 'cp src/sample/app-sample.js build/app.js'
    system 'cp src/sample/app-sample.css build/app.css'
    system 'cp -r src/sample/lib build/.'
    system 'cp -r src/img build/.'
    system 'cp README.md build/README.md'
end

desc "Build jCore Business Rule Control"
task :build do |t, args|
  Rake::Task['required'].execute
  #Rake::Task['removefolders'].execute 
  #Rake::Task['compass'].execute
  #Rake::Task['js'].execute
  #Rake::Task['sample'].execute
  #Rake::Task['package'].execute
  puts "Project has been build correctly."
end


desc "Generate Files"
task :files do
    Rake::Task['required'].execute
    Rake::Task['js'].execute
end


desc "Generate Documentation"
task :docs do
    Rake::Task['required'].execute
    Rake::Task['doc'].execute
end

task :violations do
    js_files = ""
    css_files = ""

    build_file = File.read 'config/build.json'
    sources = JSON.parse(build_file)
    sources.each do |source|
        extension = source['target_ext']
        fileName = source['name'] + '-' + getVersion + "." + extension
        writePath = source['target_path']
        if (source['lint_files'])
            #if extension == 'js'
                js_files += " " + writePath + fileName
            # else
            #     css_files += " " + writePath + fileName
            # end
        end
    end

    if js_files != ""
        system "nodelint " + js_files + " --config config/jslint/jslint.js --reporter=xml > build/logs/jslint.xml"
    end

    # if css_files != ""
    #     system "csslint " + css_files + " --format=checkstyle-xml > build/logs/checkstyle_css.xml"
    #     system "csslint " + css_files + " --format=lint-xml > build/logs/csslint.xml"
    # end
end

task :jasmine_ci do
  puts "Starting JASMINE testing..."
  system "jasmine-node specs/ --junitreport --output build/xunit/"
  puts "JASMINE testing...DONE"
end

desc "Run Jasmine Tests"
task :jasmine do
   system "jasmine-node --matchall --verbose specs"
end

task :build_ci do
    Rake::Task['required'].execute
    Rake::Task['js'].execute
    Rake::Task['doc'].execute
    Rake::Task['jasmine_ci'].execute
    Rake::Task['violations'].execute
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

def getAppName
    appname = File.read 'APP.txt'
    return appname
    exit
end

task :default do
    Rake::Task['build'].execute
end