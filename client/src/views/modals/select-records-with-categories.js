/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM - Open Source CRM application.
 * Copyright (C) 2014-2017 Yuri Kuznetsov, Taras Machyshyn, Oleksiy Avramenko
 * Website: http://www.espocrm.com
 *
 * EspoCRM is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * EspoCRM is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EspoCRM. If not, see http://www.gnu.org/licenses/.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

Espo.define('views/modals/select-records-with-categories', ['views/modals/select-records', 'views/list-with-categories'], function (Dep, List) {

    return Dep.extend({

        template: 'modals/select-records-with-categories',

        categoryScope: null,

        categoryField: 'category',

        categoryFilterType: 'inCategory',

        isExpanded: true,

        data: function () {
            var data = Dep.prototype.data.call(this);
            data.categoriesDisabled = this.categoriesDisabled;
            return data;
        },

        setup: function () {
            Dep.prototype.setup.call(this);
            this.categoriesDisabled = this.categoriesDisabled ||
                                   this.getMetadata().get('scopes.' + this.categoryScope + '.disabled') ||
                                   !this.getAcl().checkScope(this.categoryScope);
        },

        loadList: function () {
            this.loadCategories();
            Dep.prototype.loadList.call(this);
        },

        loadCategories: function () {
            this.getCollectionFactory().create(this.categoryScope, function (collection) {
                collection.url = collection.name + '/action/listTree';

                collection.data.onlyNotEmpty = true;

                this.listenToOnce(collection, 'sync', function () {
                    this.createView('categories', 'views/record/list-tree', {
                        collection: collection,
                        el: this.options.el + ' .categories-container',
                        selectable: true,
                        createDisabled: true,
                        showRoot: true,
                        rootName: this.translate(this.scope, 'scopeNamesPlural'),
                        buttonsDisabled: true,
                        checkboxes: false
                    }, function (view) {
                        view.render();

                        this.listenTo(view, 'select', function (model) {
                            this.currentCategoryId = null;
                            this.currentCategoryName = '';

                            if (model && model.id) {
                                this.currentCategoryId = model.id;
                                this.currentCategoryName = model.get('name');
                            }

                            this.applyCategoryToCollection();

                            this.notify('Please wait...');
                            this.listenToOnce(this.collection, 'sync', function () {
                                this.notify(false);
                            }, this);
                            this.collection.fetch();

                        }, this);
                    }.bind(this));
                }, this);
                collection.fetch();
            }, this);
        },

        applyCategoryToCollection: function () {
            List.prototype.applyCategoryToCollection.call(this);
        },

        isCategoryMultiple: function () {
            List.prototype.isCategoryMultiple.call(this);
        }

    });
});
