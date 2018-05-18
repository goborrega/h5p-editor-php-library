/*global H5P*/
var H5PEditor = H5PEditor || {};
var ns = H5PEditor;

H5PEditor.metadataForm = function (field, metadata, $container, parent) {
  var self = this;
  self.field = field;
  self.metadata = metadata;
  self.parent = parent;

  var $wrapper = H5PEditor.$('' +
  '<div class="h5p-editor-dialog h5p-dialog-wide h5p-metadata-wrapper">' +
    '<div class="h5p-metadata-header">' +
      '<div class="h5p-title-container">' +
        '<h2>Metadata (sharing and licensing info)</h2>' +
        '<p>Fill in the fields below</p>' +
      '</div>' +
      '<div class="metadata-button-wrapper">' +
        '<a href="#" class="h5p-metadata-button h5p-cancel">Cancel</a>' +
        '<a href="#" class="h5p-metadata-button h5p-save">Save Metadata</a>' +
      '</div>' +
    '</div>' +
  '</div>');

  $wrapper.find('.h5p-cancel').click(function () {
    $wrapper.removeClass('h5p-open');
  });

  $wrapper.find('.h5p-save').click(function () {
    $wrapper.toggleClass('h5p-open');
  });

  function setCopyright(field, value) {
    self.metadata = value;
  }

  // Create a group to handle the copyright data
  var group = new H5PEditor.widgets.group(field, getCopyrightSemantics(), self.metadata, setCopyright);
  group.appendTo($wrapper);
  group.expand();
  group.$group.find('.title').remove();
  group.$group.find('.content').addClass('copyright-form');
  field.children = [group];

  // Locate license and version selectors
  var licenseField = find(group.children, 'field.name', 'license');
  var versionField = find(group.children, 'field.name', 'licenseVersion');
  versionField.field.optional = true; // Avoid any error messages

  // Listen for changes to license
  licenseField.changes.push(function (value) {
    // Find versions for selected value
    var option = find(licenseField.field.options, 'value', value);
    var versions = (option) ? option.versions : undefined;

    versionField.$select.prop('disabled', versions === undefined);
    if (versions === undefined) {
      // If no versions add default
      versions = [{
        value: '-',
        label: '-'
      }];
    }

    // Find default selected version
    var selected = (self.metadata.license === value &&
                    self.metadata ? self.metadata.version : versions[0].value);

    // Update versions selector
    versionField.$select.html(H5PEditor.Select.createOptionsHtml(versions, selected)).change();
  });

  // Trigger update straight away
  licenseField.changes[licenseField.changes.length - 1](self.metadata.license);

  // Create and append the rest of the widgets and fields
  // Append the metadata author list widget
  H5PEditor.metadataAuthorWidget(getAuthorWidgetSemantics().fields, self.metadata, group, this.parent);

  // Append the additional license field
  var widget = H5PEditor.$('<div class="h5p-metadata-license-extras"></div>');
  ns.processSemanticsChunk([find(serversideSemantics, 'name', 'licenseExtras')], {licenseExtras: self.metadata.licenseExtras}, widget, this.parent);
  widget.appendTo(group.$group.find('.content'));

  // Append the metadata changelog widget
  H5PEditor.metadataChangelogWidget(getChangeLogWidgetSemantics(), self.metadata, group, this.parent);

  // Append the additional information field
  widget = H5PEditor.$('<div class="h5p-metadata-additional-information"></div>');
  ns.processSemanticsChunk([find(serversideSemantics, 'name', 'additionalInfoGroup')], {additionalInfoGroup:self.metadata.authorComments}, widget, this.parent);
  widget.appendTo(group.$group);

  $wrapper.appendTo($container);
};

function getCopyrightSemantics() {
  return find(serversideSemantics, 'name', 'copyright')
}

function getAuthorWidgetSemantics() {
  return find(serversideSemantics, 'name', 'authorWidget')
}

function getChangeLogWidgetSemantics() {
  return [find(serversideSemantics, 'name', 'changeLog')]
}

/**
 * Help find object in list with the given property value.
 *
 * @param {Object[]} list of objects to search through
 * @param {string} property to look for
 * @param {string} value to match property value against
 */
function find(list, property, value) {
  var properties = property.split('.');

  for (var i = 0; i < list.length; i++) {
    var objProp = list[i];

    for (var j = 0; j < properties.length; j++) {
      objProp = objProp[properties[j]];
    }

    if (objProp === value) {
      return list[i];
    }
  }
}

var ccVersions = [
  {
    'value': '4.0',
    'label': '4.0 International'
  },
  {
    'value': '3.0',
    'label': '3.0 Unported'
  },
  {
    'value': '2.5',
    'label': '2.5 Generic'
  },
  {
    'value': '2.0',
    'label': '2.0 Generic'
  },
  {
    'value': '1.0',
    'label': '1.0 Generic'
  }
]

const serversideSemantics = [
  {
    'name': 'copyright',
    'type': 'group',
    'label': 'Copyright information',
    'fields': [
      {
        'name' : 'title',
        'type' : 'text',
        'label' : 'Title',
        'description': 'Used for searching, reports and copyright information'
      },
      {
        'name' : 'license',
        'type' : 'select',
        'label' : 'License',
        'optional' : true,
        'default' : 'U',
        'options' : [
          {
            'value' : 'U',
            'label' : 'Undisclosed'
          },
          {
            'value' : 'CC BY',
            'label' : 'Attribution',
            'versions': ccVersions
          },
          {
            'value' : 'CC BY-SA',
            'label' : 'Attribution-ShareAlike',
            'versions': ccVersions
          },
          {
            'value' : 'CC BY-ND',
            'label' : 'Attribution-NoDerivs',
            'versions': ccVersions
          },
          {
            'value' : 'CC BY-NC',
            'label' : 'Attribution-NonCommercial',
            'versions': ccVersions
          },
          {
            'value' : 'CC BY-NC-SA',
            'label' : 'Attribution-NonCommercial-ShareAlike',
            'versions': ccVersions
          },
          {
            'value' : 'CC BY-NC-ND',
            'label' : 'Attribution-NonCommercial-NoDerivs',
            'versions': ccVersions
          },
          {
            'value' : 'GNU GPL',
            'label' : 'General Public License v3'
          },
          {
            'value' : 'PD',
            'label' : 'Public Domain'
          },
          {
            'value' : 'ODC PDDL',
            'label' : 'Public Domain Dedication and Licence'
          },
          {
            'value' : 'CC PDM',
            'label' : 'Public Domain Mark'
          },
          {
            'value' : 'C',
            'label' : 'Copyright'
          }
        ]
      },
      {
        'name': 'licenseVersion',
        'type': 'select',
        'label': 'License Version',
        'options': [],
        'optional' : true
      },
      {
        'name' : 'yearFrom',
        'type' : 'text',
        'label' : 'Years (from-to)',
        'placeholder' : '1991',
        'optional' : true
      },
      {
        'name' : 'yearTo',
        'label' : 'hiddenLabel',
        'type' : 'text',
        'placeholder' : '1992',
        'optional' : true
      },
      {
        'name' : 'source',
        'type' : 'text',
        'label' : 'Source',
        'placeholder' : 'http://',
        'optional' : true,
        'regexp' : {
          'pattern' : '^http[s]?://.+',
          'modifiers' : 'i'
        }
      }
    ]
  },
  {
    'name': 'authorWidget',
    'type': 'group',
    'fields': [
      {
        'label': "Author's name",
        'name': "authorName",
        'optional': true,
        'type': "text"
      },
      {
        "name": "authorRole",
        "type": "select",
        "label": "Author's role",
        "options": [
          {
            "value": "Editor",
            "label": "Editor"
          },
          {
            "value": "Licensee",
            "label": "Licensee"
          },
          {
            "value": "Originator",
            "label": "Originator"
          }
        ],
        default: "Originator"
      }
    ]
  },
  {
    name: 'licenseExtras',
    type: 'textarea',
    label: 'License Extras',
    optional: true,
    description: 'Any additional information about the license'
  },
  {
    "name": "changeLog",
    "type": "group",
    "expanded": false,
    "label": "Change Log",
    "fields": [
      {
          "name": "changeLogForm",
          "type": "group",
          "label": "Question",
          "expanded": true,
          "fields": [
            {
              "name": "date",
              "type": "text",
              "label": "Date",
              "optional": true
            },
            {
              "name": "author",
              "type": "text",
              "label": "Changed by",
              "optional": true
            },
            {
              "name": "log",
              "type": "textarea",
              "label": "Description of change",
              "placeholder": "Add a description of your change",
              "optional": true
            }
          ]
        }
    ]
  },
  {
    name: 'additionalInfoGroup',
    label: 'Additional Information',
    type: 'group',
    expanded: false,
    fields: [
      {
        name: 'additionalInfo',
        type: 'textarea',
        label: 'Author comments',
        description: 'Comments for the editor of the content (This text will not be published as a part of copyright info)',
        optional: true
      }
    ]
  }
]
