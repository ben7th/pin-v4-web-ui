/* Demo Note:  This demo uses a FileProgress class that handles the UI for displaying the file name and percent complete.
The FileProgress class is not part of SWFUpload.
 */


/* **********************
   Event Handlers
   These are my custom event handlers to make my
   web application behave the way I went when SWFUpload
   completes different tasks.  These aren't part of the SWFUpload
   package.  They are part of my application.  Without these none
   of the actions SWFUpload makes will show up in my application.
 ********************** */
function fileQueued(file) {
  try {
    var progress = new FileProgress(file, this.customSettings.progressTarget);
    progress.setStatus("未上传，等待中...");
    progress.toggleCancel(true, this);

  } catch (ex) {
    this.debug(ex);
  }

}

function fileQueueError(file, errorCode, message) {
  try {
    if (errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
      alert("You have attempted to queue too many files.\n" + (message === 0 ? "You have reached the upload limit." : "You may select " + (message > 1 ? "up to " + message + " files." : "one file.")));
      return;
    }

    var progress = new FileProgress(file, this.customSettings.progressTarget);
    progress.setError();
    progress.toggleCancel(false);

    switch (errorCode) {
      case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
        progress.setStatus("文件太大");
        this.debug("Error Code: File too big, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
        progress.setStatus("不能上传零字节文件");
        this.debug("Error Code: Zero byte file, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
        progress.setStatus("无效的文件类型");
        this.debug("Error Code: Invalid File Type, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      default:
        if (file !== null) {
          progress.setStatus("Unhandled Error");
        }
        this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
    }
  } catch (ex) {
    this.debug(ex);
  }
}

function fileDialogComplete(numFilesSelected, numFilesQueued) {
  try {
    if (numFilesSelected > 0) {
      document.getElementById(this.customSettings.cancelButtonId).disabled = false;
    }
		
    /* I want auto start the upload and I can do that here */
    this.startUpload();
  } catch (ex)  {
    this.debug(ex);
  }
}

function uploadStart(file) {
  try {
    /* I don't want to do any file validation or anything,  I'll just update the UI and
		return true to indicate that the upload should start.
		It's important to update the UI here because in Linux no uploadProgress events are called. The best
		we can do is say we are uploading.
		 */
    var progress = new FileProgress(file, this.customSettings.progressTarget);
    progress.setStatus("正在上传...");
    progress.toggleCancel(true, this);
  }
  catch (ex) {}
	
  return true;
}

function uploadProgress(file, bytesLoaded, bytesTotal) {
  try {
    var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);

    var progress = new FileProgress(file, this.customSettings.progressTarget);
    progress.setProgress(percent);
    progress.setStatus("正在上传...");
  } catch (ex) {
    this.debug(ex);
  }
}

// 每上传成功一个文件，就会运行一遍
function uploadSuccess(file, serverData) {
  try {
    eval(serverData)
    var progress = new FileProgress(file, this.customSettings.progressTarget);
    progress.setComplete();
    progress.setStatus("上传完成.");
    progress.toggleCancel(false);
  } catch (ex) {
    this.debug(ex);
  }
}

function uploadError(file, errorCode, message) {
  try {
    var progress = new FileProgress(file, this.customSettings.progressTarget);
    progress.setError();
    progress.toggleCancel(false);

    switch (errorCode) {
      case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
        progress.setStatus("上传错误: " + message);
        this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
        progress.setStatus("上传失败.");
        this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.IO_ERROR:
        progress.setStatus("Server (IO) Error");
        this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
        progress.setStatus("Security Error");
        this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
        progress.setStatus("Upload limit exceeded.");
        this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
        progress.setStatus("Failed Validation.  Upload skipped.");
        this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
        // If there aren't any files left (they were all cancelled) disable the cancel button
        if (this.getStats().files_queued === 0) {
          document.getElementById(this.customSettings.cancelButtonId).disabled = true;
        }
        progress.setStatus("被取消");
        progress.setCancelled();
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
        progress.setStatus("停止");
        break;
      default:
        progress.setStatus("Unhandled Error: " + errorCode);
        this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
    }
  } catch (ex) {
    this.debug(ex);
  }
}

// 整个列表中的文件全部上传完后，会运行这个方法
function uploadComplete(file) {
  if (this.getStats().files_queued === 0) {
    document.getElementById(this.customSettings.cancelButtonId).disabled = true;
  }
}

// This event comes from the Queue Plugin
function queueComplete(numFilesUploaded) {
  var status = document.getElementById("divStatus");
  status.innerHTML = numFilesUploaded + " 个文件" + " 上传完成.";
}

// 单独上传一个文件的回调(导入课程时用)
single_file_upload = {
  swfupload_loaded_handler : function(){
    $(this.customSettings.startUploadBtn).observe('click',function(){
      this.startUpload()
    }.bind(this))
  },
  // 显示上传进度
  upload_progress_handler : function (file, bytesLoaded, bytesTotal) {
    var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
    if(bytesLoaded === bytesTotal){
      var progress = new FileProgress(file, this.customSettings.progressTarget);
      progress.setComplete();
      progress.setStatus("上传完成.后台正在处理解析数据");
      progress.toggleCancel(false);
    } else{
      var progress = new FileProgress(file, this.customSettings.progressTarget);
      progress.setProgress(percent);
      progress.setStatus("正在上传...");
    }
  },
  // 文件不合法的错误提示
  file_queue_error_handler : function (file, errorCode, message) {
    switch (errorCode) {
      case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
        alert("文件太大");
        break;
      case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
        alert("文件不能是零字节");
        break;
      case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
        alert("无效的文件类型");
        break;
    }
  },
  // 文件上传成功后，运行 rjs
  upload_success_handler : function (file, serverData) {
    eval(serverData)
  },
  // 向上传队列增加文件时,把文件名称显示出来
  file_queued_handler : function (file) {
    id = this.customSettings.inputFileName
    $(id).setAttribute('value',file.name)
  },
  // 点击选择文件时运行,因为只上传一个文件，每次选择文件时，清空文件上传队列
  file_dialog_start_handler: function (){
    id = this.customSettings.inputFileName
    $(id).setAttribute('value', '')
    this.cancelUpload();
  },
  // 上传出现异常时的处理
  upload_error_handler : function (file, errorCode, message) {
    if(errorCode == SWFUpload.UPLOAD_ERROR.FILE_CANCELLED){
      return
    }
    var progress = new FileProgress(file, this.customSettings.progressTarget);
    progress.setError();
    progress.toggleCancel(false);
    switch (errorCode) {
      case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
        progress.setStatus("上传错误: " + message);
        this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
        progress.setStatus("上传失败.");
        this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.IO_ERROR:
        progress.setStatus("Server (IO) Error");
        this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
        progress.setStatus("Security Error");
        this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
        progress.setStatus("Upload limit exceeded.");
        this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
        progress.setStatus("Failed Validation.  Upload skipped.");
        this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
        progress.setStatus("停止");
        break;
    }
  }
};

attachment_file_upload = {
  // 显示上传进度
  upload_progress_handler : function (file, bytesLoaded, bytesTotal) {
    try {
      var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
      var progress = new FileProgress(file, this.customSettings.progressTarget);
      progress.setProgress(percent);
      progress.setStatus("正在上传...");
    } catch (ex) {
      this.debug(ex);
    }
  },
  // 运行服务器传回的 rjs
  upload_success_handler : function (file, serverData) {
    try {
      var attachment_list_id = this.customSettings.attachmentListId
      var str = serverData
      new Insertion.Bottom(attachment_list_id,str)
      var progress = new FileProgress(file, this.customSettings.progressTarget);
      progress.setComplete();
      progress.setStatus("上传完成.");
      progress.toggleCancel(false);
    } catch (ex) {
      this.debug(ex);
    }
  },
  // 开始上传,提供取消按钮
  upload_start_handler : function (file) {
    try {
      var progress = new FileProgress(file, this.customSettings.progressTarget);
      progress.setStatus("正在上传...");
      progress.toggleCancel(true, this);
    }
    catch (ex) {}
    return true;
  },
  // 上传失败的错误提示
  upload_error_handler : function (file, errorCode, message) {
    if(errorCode == SWFUpload.UPLOAD_ERROR.FILE_CANCELLED){
      id = this.customSettings.progressTarget
      $(id).innerHTML = ""
      return
    }
    var progress = new FileProgress(file, this.customSettings.progressTarget);
    progress.setError();
    progress.toggleCancel(false);
    switch (errorCode) {
      case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
        progress.setStatus("上传错误: " + message);
        this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
        progress.setStatus("上传失败.");
        this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.IO_ERROR:
        progress.setStatus("Server (IO) Error");
        this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
        progress.setStatus("Security Error");
        this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
        progress.setStatus("Upload limit exceeded.");
        this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
        progress.setStatus("Failed Validation.  Upload skipped.");
        this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
        progress.setStatus("停止");
        break;
    }
  },
  // 文件不合法的错误提示
  file_queue_error_handler : function (file, errorCode, message) {
    switch (errorCode) {
      case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
        alert("文件太大");
        break;
      case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
        alert("文件不能是零字节");
        break;
      case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
        alert("无效的文件类型");
        break;
    }
  },
  // 增加文件立即上传
  file_queued_handler : function() {
    this.startUpload()
  },
  // 每个文件上传完成后运行
  upload_complete_handler : function() {
    id = this.customSettings.progressTarget
    $(id).innerHTML = ""
  }
};

share_img_upload = {
  // 显示上传进度
  upload_progress_handler : function (file, bytesLoaded, bytesTotal) {
    try {
      var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
      $(this.customSettings.progressTarget).update("上传进度 " + percent + "%")
    } catch (ex) {
      this.debug(ex);
    }
  },
  // 运行服务器传回的 rjs
  upload_success_handler : function (file, serverData) {
    try {
      var str = serverData
      eval(str)
      var obj = $(this.movieName)
      obj.addClassName("hide")
    } catch (ex) {
      this.debug(ex);
    }
  },
  // 开始上传
  upload_start_handler : function (file) {
    try {
      $(this.customSettings.progressTarget).update("开始上传")
    }
    catch (ex) {}
    return true;
  },
  // 上传失败的错误提示
  upload_error_handler : function (file, errorCode, message) {
    switch (errorCode) {
      case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
        alert("上传错误: " + message)
        this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
        alert("上传失败.");
        this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.IO_ERROR:
        alert("Server (IO) Error");
        this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
        alert("Security Error");
        this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
        alert("Upload limit exceeded.");
        this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
        alert("Failed Validation.  Upload skipped.");
        this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
        alert("停止");
        break;
    }
  },
  // 文件不合法的错误提示
  file_queue_error_handler : function (file, errorCode, message) {
    switch (errorCode) {
      case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
        alert("文件太大");
        break;
      case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
        alert("文件不能是零字节");
        break;
      case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
        alert("无效的文件类型");
        break;
    }
  },
  // 增加文件立即上传
  file_queued_handler : function() {
    this.startUpload()
  },
  // 每个文件上传完成后运行
  upload_complete_handler : function() {
  }
};