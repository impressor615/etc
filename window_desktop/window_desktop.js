const HTML = `<div class="action-pane" style="#{style}" data-key="#{pk}" draggable>
  <div class="action-pane-header">
    <button
      class="close"
      type="button"
    >
      &times;
    </button>
  </div>
  <div class="action-pane-body">
      <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</p>
  </div>
  <div class="action-pane-footer">
    <button type="button" class="ok">OK</button>
  </div>
</div>`;

function generateKey(length) {
  var key = "";
  while (key.length < length) {
    key += Math.random().toString(16).substring(2);
  }
  return key.substring(0, length);
};

function ActionPane(pk, seq, template = HTML) {
  this._pk = pk;
  this._seq = seq;
  this._x = 0;
  this._y = 0;
  this._active = true;
  this._created_at = new Date();
  this._template = template;
}

ActionPane.prototype.get = function(key) {
  return this[`_${key}`];
};

ActionPane.prototype.set = function(key, value) {
  return this[`_${key}`] = value;
};

ActionPane.prototype.build = function() {
  const seq = this.get('seq');
  const offset = Math.floor(Math.random() * 10) * 5;
  const xOffset = Math.random() >= 0.5 ? offset : -offset;
  const yOffset = Math.random() >= 0.5 ? offset : -offset;
  const styleString = `transform: translate(${-50 + xOffset}%, ${-50 + yOffset}%);
    z-index: ${seq};`;
  return this._template
    .replace('#{style}', styleString)
    .replace(/#{pk}/g, this.get('pk'));
};

ActionPane.prototype.setXAndY = function() {
  const pk = this.get('pk');
  const position = $(`.action-pane[data-key=${pk}]`).position();
  this.set('x', position.left);
  this.set('y', position.top);
}

function ActionStore() {
  this._actionPanes = [];
};

ActionStore.prototype.addPane = function(pane) {
  this._actionPanes = this._actionPanes.map(function(pane) {
    pane.set('active', false);
    return pane;
  });
  this._actionPanes.push(pane);
  const html = pane.build();

  $('.action-pane').addClass('inactive');
  $('.window-desktop-container').append(html)
};

ActionStore.prototype.deletePane = function(pk) {
  const deleteIndex = this._actionPanes
    .findIndex(function(pane) { return pane.get('pk') == pk; });
  const isDeleteItemActive = this._actionPanes[deleteIndex].get('active');
  this._actionPanes.splice(deleteIndex, 1);
  if (isDeleteItemActive && this._actionPanes.length !== 0) {
    const nextActiveItem = this._actionPanes[this._actionPanes.length - 1];
    nextActiveItem.set('active', true);
    $(`.action-pane[data-key=${nextActiveItem.get('pk')}]`).removeClass('inactive');
  }

  $(`.action-pane[data-key=${pk}]`).remove();
};

ActionStore.prototype.getPanes = function() {
  return this._actionPanes;
};

ActionStore.prototype.getPane = function(pk) {
  return this._actionPanes.find(function(pane) {
    return pane.get('pk') === pk;
  })
};

ActionStore.prototype.getActivePane = function() {
  return this._actionPanes.find(function(pane) {
    return pane.get('active');
  });
};

$(document).ready(function() {
  let dragging = null;
  let seq = 0;
  const actionStores = new ActionStore();

  $('body').on('mousemove', function(e) {
    if (dragging) {
      $(dragging).offset({
        top: e.pageY,
        left: e.pageX,
      });
    }
  });

  $('.plus').on('click', function() {
    const pk = generateKey(10);
    const actionPane = new ActionPane(pk, seq);
    actionStores.addPane(actionPane);
    actionPane.setXAndY();

    $(`.action-pane[data-key=${pk}]`).on('click', function(e) {
      e.stopPropagation();
      const activePane = actionStores.getActivePane();
      const activePk = activePane.get('pk');
      const activeNode = $(`.action-pane[data-key=${activePk}]`);
      const activeZindex= $(activeNode).css('z-index');
      const thisPk = $(this).data('key');
      const thisPane = actionStores.getPane(thisPk);
      if (activePk === thisPk) {
        return;
      }

      activePane.set('active', false);
      thisPane.set('active', true);

      $(this).removeClass('inactive');
      $(this).css('z-index', activeZindex);

      $(`.action-pane[data-key=${activePk}]`).addClass('inactive');
      $(`.action-pane[data-key=${activePk}]`).css('z-index', activeZindex - 1);
    });

    $(`.action-pane[data-key=${pk}] .close, .action-pane[data-key=${pk}] .ok`)
      .on('click', function(e) {
        e.stopPropagation();
        const pk = $(this).parent().parent().data('key');
        actionStores.deletePane(pk);
      });

    $(`.action-pane[data-key=${pk}]`).on('mouseup', function(e) {
      const thisPk = $(e.currentTarget).data('key');
      const thisPane = actionStores.getPane(thisPk);
      thisPane.setXAndY();
      dragging = null;
    });

    $(`.action-pane[data-key=${pk}] .action-pane-header`).on('mousedown', function(e) {
      dragging = $(e.currentTarget).parent();
    });

    seq += 1;
  });
});