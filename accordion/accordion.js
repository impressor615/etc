function isActive(index) {
  return $(`[data-index=${index}]`).hasClass('active');
}

function setActive(index) {
  const dataAttrString = `[data-index=${index}]`;
  $(dataAttrString).addClass('active');
  $(dataAttrString)
    .children('.arrow')
    .removeClass('down')
    .addClass('up');
  $(dataAttrString)
    .siblings('.accordion-content')
    .slideDown(300);
}

function reset() {
  $('.accordion-header').removeClass('active');
  $('.arrow')
    .removeClass('up')
    .addClass('down');
  $('.accordion-header')
    .siblings('.accordion-content')
    .slideUp(300);
}

$(document).ready(function() {
  $('.accordion-header').on('click', function() {
    const headerIndex = $(this).data('index');
    const isThisActive = isActive(headerIndex);
    if (isThisActive) {
      reset();
      return;
    }

    reset();
    setActive(headerIndex);
  });
});
