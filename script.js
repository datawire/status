$(document).ready(function () {
    var config = {
        github: {
            org: 'datawire',
            repo: 'status'
        }
    };

    var sinceDate = new Date();
    sinceDate.setMonth(sinceDate.getMonth() - 1);
    var listIssuesSince = sinceDate.toISOString();

    $.getJSON('https://api.github.com/repos/' + config.github.org + '/' + config.github.repo + '/issues?state=all&since=' + listIssuesSince).done(render);

    function render(issues) {
        var issuesCount = 0;
        issues.forEach(function (issue) {
            if (issue.labels.length === 0) {
                // Skip this issue if it has no labels.
                // Everybody can open issues but only members of the org can set labels.
                return;
            }
            issuesCount++;
            var status = issue.labels.reduce(function (status, label) {
                if (/^status:/.test(label.name)) {
                    return label.name.replace('status:', '');
                } else {
                    return status;
                }
            }, 'operational');

            var systems = issue.labels.filter(function (label) {
                return /^system:/.test(label.name);
            }).map(function (label) {
                return label.name.replace('system:', '')
            });

            if (issue.state === 'open') {
                $('#panel').data('incident', 'true');
                $('#panel').attr('class', (status === 'operational' ? 'panel-success' : 'panel-warning'));
                $('#paneltitle').html('<a href="#incidents">' + issue.title + '</a>');
            }

            var html = '<article class="timeline-entry">\n';
            html += '<div class="timeline-entry-inner">\n';

            if (issue.state === 'closed') {
                html += '<div class="timeline-icon bg-success"><i class="entypo-feather"></i></div>';
            } else {
                html += '<div class="timeline-icon bg-secondary"><i class="entypo-feather"></i></div>';
            }

            html += '<div class="timeline-label">\n';
            html += '<span class="date">' + datetime(issue.created_at) + '</span>\n';

            if (issue.state === 'closed') {
                html += '<span class="badge label-success pull-right">closed</span>';
            } else {
                html += '<span class="badge ' + (status === 'operational' ? 'label-success' : 'label-warning') + ' pull-right">open</span>\n';
            }

            for (var i = 0; i < systems.length; i++) {
                html += '<span class="badge system pull-right">' + systems[i] + '</span>';
            }

            html += '<h2>' + issue.title + '</h2>\n';
            html += '<hr>\n';
            html += '<p>' + issue.body + '</p>\n';

            if (issue.state === 'closed') {
                html += '<p><em>Updated ' + datetime(issue.closed_at) + '<br/>';
                html += 'The system is back in normal operation.</p>';
            }
            html += '</div>';
            html += '</div>';
            html += '</article>';
            $('#incidents').append(html);
        });

        if (issuesCount === 0) {
            $('#incidents').append(`
<article class="timeline-entry">
<div class="timeline-entry-inner">
<div class="timeline-icon bg-success"><i class="entypo-feather"></i></div>
<div class="timeline-label">
<h2>All systems are operating normally</h2>
<hr>
<p><em>Since ${datetime(listIssuesSince)}<br/>
</div>
</div>
</article>`);
        }

        function datetime(string) {
            var date = new Date(string);
            return date.toDateString() + ' ' + date.toLocaleTimeString();
        }
    }
});