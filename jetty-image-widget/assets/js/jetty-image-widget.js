(function (doc, $, i18n) {
  'use strict'
  var frame, imageinput, thumbnail, index

  function findAncestor(el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls));
    return el;
  }

  function createMediaItem(wid, index) {
    var mediaItem  = doc.createElement('div'),
        chooser    = doc.createElement('div'),
        button     = doc.createElement('a'),
        sbutton    = doc.createElement('a'),
        attachment = doc.createElement('input'),
        figure     = doc.createElement('figure'),
        removeB    = doc.createElement('a'),
        labelUrl   = doc.createElement('label'),
        inputUrl   = doc.createElement('input')

    mediaItem.className = 'media-item media-item-' + index
    mediaItem.dataset.index = index

    attachment.type = 'hidden'
    attachment.name = 'widget-jetty_image_widget[' + wid + '][media][' + index + '][image]'
    attachment.className = 'jiw_repeatable_attachment_id_field'
    attachment.value = -1

    chooser.className = 'jetty-image-choose-action'

    button.href = '#'
    button.className = 'jiw_upload_file_button button button-primary'
    button.appendChild(doc.createTextNode(i18n.btn_text))

    sbutton.href = '#'
    sbutton.className = 'jetty-remove-image button button-secondary'
    sbutton.appendChild(doc.createTextNode(i18n.remove_text))

    chooser.appendChild(button)
    chooser.appendChild(sbutton)

    figure.className = 'image-preview'

    labelUrl.for = 'media-url-' + index
    labelUrl.appendChild(doc.createTextNode(i18n.label_url))

    removeB.className = 'jetty-remove-image hidden'
    removeB.href = '#'
    removeB.appendChild(doc.createTextNode(i18n.remove_text))
    figure.appendChild(removeB)

    inputUrl.type = 'url'
    inputUrl.id   = 'media-url-' + index
    inputUrl.name = 'widget-jetty_image_widget[' + wid + '][media][' + index + '][url]'
    inputUrl.value = ''

    mediaItem.appendChild(attachment)
    mediaItem.appendChild(chooser)
    mediaItem.appendChild(figure)
    mediaItem.appendChild(labelUrl)
    mediaItem.appendChild(inputUrl)

    return mediaItem
  }

  function fileUploadHandler(e) {
    e.preventDefault()
    var target     = $(e.currentTarget),
        box        = target.closest('div.media-item')

    index          = target.closest('div.media-item').data('index')
    imageinput     = target.closest('div.media-item').find('.jiw_repeatable_attachment_id_field'),
    thumbnail      = target.closest('div.media-item').find('figure')

    if (typeof frame !== 'undefined') {
      frame.open()
      return
    }
    frame = wp.media.frames.file_frame = wp.media({
      title: i18n.title,
      button: {
        text: i18n.text
      },
      multiple: false
    })
    frame.on('select', function() {
      var attachment = frame.state().get('selection').first().toJSON()
      // don't accept an image
      if (attachment.type !== 'image') {
        return;
      }
      // we have an image selected
      imageinput.val(attachment.id)
      if (thumbnail) {
        var image = doc.createElement('img'),
            btn  = thumbnail.find('.jetty-remove-image')
        image.className = 'preview-image-item preview-image-item-' + index
        image.src = attachment.url
        thumbnail.html(image)
      }
    })
    frame.open()
  }

  function addMoreHandler(e) {
    e.preventDefault()

    var container   = findAncestor(e.currentTarget, 'jetty-image-widget-form'),
        items       = container.querySelectorAll('.media-item'),
        target      = e.currentTarget,
        wid         = target.dataset.widgetbase

    if (items.length < 8) {
      // find next id for index
      var nextid = 0;
      for (var i = 0, len = items.length; i < len; i++) {
        nextid = Math.max(items[i].dataset.index, nextid)
      }
      container.insertBefore(createMediaItem(wid, nextid + 1), e.currentTarget)
      if (items.length === 7) {
        e.currentTarget.classList.add('hidden')
      }
    }
  }

  function removeImageHandler(e) {
    e.preventDefault()

    var box        = findAncestor(e.currentTarget, 'media-item'),
        container  = findAncestor(e.currentTarget, 'jetty-image-widget-form')

    container.removeChild(box);
    var items = container.querySelectorAll('.media-item')
    if (items.length < 8) {
      var button = container.querySelector('.jiw-add-more')
      button.classList.remove('hidden')
    }
  }

  function main() {
    $(doc.body)
      .on('click', '.jetty-image-widget-form .jiw_upload_file_button', fileUploadHandler)
      .on('click', '.jetty-image-widget-form .jiw-add-more', addMoreHandler)
      .on('click', '.jetty-image-widget-form .jetty-remove-image', removeImageHandler)
  }
  // load on first animation frame, effectively it wait documents body ready
  requestAnimationFrame(main)
})(document, jQuery, jiw_admin_uploader_i18n)