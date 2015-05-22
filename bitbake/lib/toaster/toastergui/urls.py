#
# BitBake Toaster Implementation
#
# Copyright (C) 2013        Intel Corporation
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License version 2 as
# published by the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

from django.conf.urls import patterns, include, url
from django.views.generic import RedirectView, TemplateView

from django.http import HttpResponseBadRequest
import tables
from widgets import ToasterTemplateView

urlpatterns = patterns('toastergui.views',
        # landing page
        url(r'^landing/$', 'landing', name='landing'),

        url(r'^builds/$', 'builds', name='all-builds'),
        # build info navigation
        url(r'^build/(?P<build_id>\d+)$', 'builddashboard', name="builddashboard"),

        url(r'^build/(?P<build_id>\d+)/tasks/$', 'tasks', name='tasks'),
        url(r'^build/(?P<build_id>\d+)/tasks/(?P<task_id>\d+)/$', 'tasks_task', name='tasks_task'),
        url(r'^build/(?P<build_id>\d+)/task/(?P<task_id>\d+)$', 'task', name='task'),

        url(r'^build/(?P<build_id>\d+)/recipes/$', 'recipes', name='recipes'),
        url(r'^build/(?P<build_id>\d+)/recipe/(?P<recipe_id>\d+)/active_tab/(?P<active_tab>\d{1})$', 'recipe', name='recipe'),
        url(r'^build/(?P<build_id>\d+)/recipe/(?P<recipe_id>\d+)$', 'recipe', name='recipe'),
        url(r'^build/(?P<build_id>\d+)/recipe_packages/(?P<recipe_id>\d+)$', 'recipe_packages', name='recipe_packages'),

        url(r'^build/(?P<build_id>\d+)/packages/$', 'bpackage', name='packages'),
        url(r'^build/(?P<build_id>\d+)/package/(?P<package_id>\d+)$', 'package_built_detail',
                name='package_built_detail'),
        url(r'^build/(?P<build_id>\d+)/package_built_dependencies/(?P<package_id>\d+)$',
            'package_built_dependencies', name='package_built_dependencies'),
        url(r'^build/(?P<build_id>\d+)/package_included_detail/(?P<target_id>\d+)/(?P<package_id>\d+)$',
            'package_included_detail', name='package_included_detail'),
        url(r'^build/(?P<build_id>\d+)/package_included_dependencies/(?P<target_id>\d+)/(?P<package_id>\d+)$',
            'package_included_dependencies', name='package_included_dependencies'),
        url(r'^build/(?P<build_id>\d+)/package_included_reverse_dependencies/(?P<target_id>\d+)/(?P<package_id>\d+)$',
            'package_included_reverse_dependencies', name='package_included_reverse_dependencies'),

        # images are known as targets in the internal model
        url(r'^build/(?P<build_id>\d+)/target/(?P<target_id>\d+)$', 'target', name='target'),
        url(r'^build/(?P<build_id>\d+)/target/(?P<target_id>\d+)/targetpkg$', 'targetpkg', name='targetpkg'),
        url(r'^dentries/build/(?P<build_id>\d+)/target/(?P<target_id>\d+)$', 'xhr_dirinfo', name='dirinfo_ajax'),
        url(r'^build/(?P<build_id>\d+)/target/(?P<target_id>\d+)/dirinfo$', 'dirinfo', name='dirinfo'),
        url(r'^build/(?P<build_id>\d+)/target/(?P<target_id>\d+)/dirinfo_filepath/_(?P<file_path>(?:/[^/\n]+)*)$', 'dirinfo', name='dirinfo_filepath'),
        url(r'^build/(?P<build_id>\d+)/configuration$', 'configuration', name='configuration'),
        url(r'^build/(?P<build_id>\d+)/configvars$', 'configvars', name='configvars'),
        url(r'^build/(?P<build_id>\d+)/buildtime$', 'buildtime', name='buildtime'),
        url(r'^build/(?P<build_id>\d+)/cpuusage$', 'cpuusage', name='cpuusage'),
        url(r'^build/(?P<build_id>\d+)/diskio$', 'diskio', name='diskio'),

        # image information dir
        url(r'^build/(?P<build_id>\d+)/target/(?P<target_id>\d+)/packagefile/(?P<packagefile_id>\d+)$',
             'image_information_dir', name='image_information_dir'),

        # build download artifact
        url(r'^build/(?P<build_id>\d+)/artifact/(?P<artifact_type>\w+)/id/(?P<artifact_id>\w+)', 'build_artifact', name="build_artifact"),

        # project URLs
        url(r'^newproject/$', 'newproject', name='newproject'),


        url(r'^projects/$', 'projects', name='all-projects'),

        url(r'^project/$', lambda x: HttpResponseBadRequest(), name='base_project'),

        url(r'^project/(?P<pid>\d+)/$', 'project', name='project'),
        url(r'^project/(?P<pid>\d+)/configuration$', 'projectconf', name='projectconf'),
        url(r'^project/(?P<pid>\d+)/builds/$', 'projectbuilds', name='projectbuilds'),

        url(r'^project/(?P<pid>\d+)/layer/(?P<layerid>\d+)$', 'layerdetails', name='layerdetails'),
        url(r'^project/(?P<pid>\d+)/layer/$', lambda x,pid: HttpResponseBadRequest(), name='base_layerdetails'),

        # the import layer is a project-specific functionality;
        url(r'^project/(?P<pid>\d+)/importlayer$', 'importlayer', name='importlayer'),

        url(r'^project/(?P<pid>\d+)/machines/$',
            ToasterTemplateView.as_view(template_name="generic-toastertable-page.html"),
            { 'table_name': tables.MachinesTable.__name__.lower(),
              'title' : 'All compatible machines' },
            name="all-machines"),

        url(r'^project/(?P<pid>\d+)/recipes/$',
            ToasterTemplateView.as_view(template_name="generic-toastertable-page.html"),
            { 'table_name': tables.RecipesTable.__name__.lower(),
              'title' : 'All compatible recipes' },
            name="all-targets"),

        url(r'^project/(?P<pid>\d+)/layers/$',
            ToasterTemplateView.as_view(template_name="generic-toastertable-page.html"),
            { 'table_name': tables.LayersTable.__name__.lower(),
              'title' : 'All compatible layers' },
            name="all-layers"),


        url(r'^xhr_build/$', 'xhr_build', name='xhr_build'),
        url(r'^xhr_projectbuild/(?P<pid>\d+)$', 'xhr_projectbuild', name='xhr_projectbuild'),
        url(r'^xhr_projectinfo/$', 'xhr_projectinfo', name='xhr_projectinfo'),
        url(r'^xhr_projectedit/(?P<pid>\d+)$', 'xhr_projectedit', name='xhr_projectedit'),
        url(r'^xhr_configvaredit/(?P<pid>\d+)$', 'xhr_configvaredit', name='xhr_configvaredit'),

        url(r'^xhr_datatypeahead/(?P<pid>\d+)$', 'xhr_datatypeahead', name='xhr_datatypeahead'),
        url(r'^xhr_importlayer/$', 'xhr_importlayer', name='xhr_importlayer'),
        url(r'^xhr_updatelayer/$', 'xhr_updatelayer', name='xhr_updatelayer'),
        url(r'^xhr_tables/(?P<pid>\d+)/', include('toastergui.tables')),

        # dashboard for failed build requests
        url(r'^project/(?P<pid>\d+)/buildrequest/(?P<brid>\d+)$', 'buildrequestdetails', name='buildrequestdetails'),

        # default redirection
        url(r'^$', RedirectView.as_view( url= 'landing')),
)
