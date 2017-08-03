
function Wedge(value, id, selected = false) {
    this.value = value;
    this.id = id;
    this.selected = selected;
}


function DonutComponent() {
    var dc = this;
    /** Constants */
    dc.donutThickness = 90;
    dc.donutPadding = 20;
    dc.donutSelectedDelta = 10;
    dc.donutHoverDelta = 5;

    /** data */
    dc.data = [new Wedge(20, 0, true), new Wedge(10, 1), new Wedge(15, 2), new Wedge(18, 3), new Wedge(4, 4), new Wedge(12, 5), new Wedge(35, 6)];

    /** Member Variables */
    dc.svg;
    dc.arcGroup;
    dc.arc;
    dc.selectedArc;
    dc.hoverArc;
    dc.color = d3.scaleOrdinal().range(d3.schemeCategory20);
    dc.width;
    dc.height;
    dc.radius;

    dc.init = function() {
        dc.svg = d3.select('svg');
        dc.arcGroup = dc.svg.append('g');
        initSvg();
    }

    function initSvg() {
        //Store attributes
        dc.width = +dc.svg.attr('width');
        dc.height = +dc.svg.attr('height');
        dc.radius = Math.min(dc.width, dc.height) / 2;

        //Calculate arc parameters.
        var innerRadius = dc.radius - (dc.donutThickness + dc.donutPadding);
        var outerRadius = dc.radius - dc.donutPadding;
        dc.arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
        dc.selectedArc = d3.arc().innerRadius(innerRadius - dc.donutSelectedDelta).outerRadius(outerRadius + dc.donutSelectedDelta);
        dc.hoverArc = d3.arc().innerRadius(innerRadius - dc.donutHoverDelta).outerRadius(outerRadius + dc.donutHoverDelta);
        dc.arcGroup.attr('transform', 'translate(' + dc.width / 2 + ',' + dc.height / 2 + ')');

        renderMarker();
        renderPie();
    }

    function renderMarker() {
        var bWidth = 300;
        var bHeight = 100;
        var aRadius = 5;
        var altitude = 40;

        var p1 = { x: (dc.width / 2) - (bWidth / 2), y: (dc.height / 2) };
        var p2 = { x: 0, y: -((bHeight / 2) - aRadius) };
        var a2to3 = { xRadius: aRadius, yRadius: aRadius, orientation: '0 0 1', x: aRadius, y: -aRadius };
        var p3 = { x: aRadius, y: 0 };
        var p4 = { x: bWidth - aRadius, y: 0 };
        var p5 = { x: altitude, y: bHeight / 2 };
        var p6 = { x: -altitude, y: bHeight - p5.y };
        var p7 = { x: -bWidth, y: 0 };
        var a7to8 = { xRadius: aRadius, yRadius: aRadius, orientation: '0 0 1', x: -aRadius, y: -aRadius };
        var p8 = { x: 0, y: -((bHeight / 2) - aRadius) };

        var g = dc.svg.append('g');
        g.append('path').attr('d',
            `M ${p1.x},${p1.y}
			 l ${p2.x},${p2.y}
			 a ${a2to3.xRadius}, ${a2to3.yRadius} ${a2to3.orientation} ${a2to3.x},${a2to3.y}
			 l ${p3.x},${p3.y}
			 l ${p4.x},${p4.y}
			 l ${p5.x},${p5.y}
			 l ${p6.x},${p6.y}
			 l ${p7.x},${p7.y}
			 a ${a7to8.xRadius}, ${a7to8.yRadius} ${a7to8.orientation} ${a7to8.x},${a7to8.y}
			 l ${p8.x},${p8.y}`)
            .style('fill', 'white')
            .attr('stroke', 'black')
            .style('filter', 'url(#dropshadow)');
        g.append('foreignObject').attr('width', bWidth).attr('height', bHeight).attr('transform', `translate(${(dc.width / 2) - (bWidth / 2)}, ${(dc.height / 2) - (bHeight / 2)})`).html('<div class="marker">Procedures and reference Do... <b>48 Events (10% of total)</b></div>');
    }

    function renderPie() {
        var wedges = d3.pie().value((d) => d.value)(dc.data);

        var existingPaths = dc.arcGroup.selectAll('.arc').data(wedges);

        existingPaths.select('path')
            .attr('d', (datum) => {
                if (datum.data.selected) {
                    return dc.selectedArc(datum);
                }
                return dc.arc(datum);
            })
            .style('filter', (datum, i) => {
                if (datum.data.selected) {
                    return 'url(#dropshadow)';
                }
            })
            .style('fill', (datum, i) => dc.color(datum.data.id));

        var newPaths = existingPaths.enter().append('g')
            .attr('class', 'arc');

        newPaths.append('path')
            .attr('d', (datum) => {
                if (datum.data.selected) {
                    return dc.selectedArc(datum);
                }
                return dc.arc(datum);
            })
            .style('filter', (datum, i) => {
                if (datum.data.selected) {
                    return 'url(#dropshadow)';
                }
            })
            .style('fill', (datum, i) => dc.color(datum.data.id))
            .on('click', (datum) => {
                dc.data.forEach(j => j.selected = false);
                datum.data.selected = true;
                renderPie();
            })
            .on('mouseenter', function (datum) {
                d3.select(this).attr('d', _datum => dc.hoverArc(_datum));
            })
            .on('mouseleave', function (datum) {
                d3.select(this).attr('d', _datum => dc.arc(_datum));
            });

        dc.arcGroup.selectAll('.arc').filter((d) => d.data.selected).raise();

        //rotate to selected wedge.
        var selectedWedge = wedges.find(wedge => wedge.data.selected);
        var rotationDelta = toDegree(((Math.PI / 2) - selectedWedge.startAngle) - ((selectedWedge.endAngle - selectedWedge.startAngle) / 2));
        dc.arcGroup.transition().attr('transform', 'translate(' + dc.width / 2 + ',' + dc.height / 2 + ') rotate(' + rotationDelta + ',0,0)');
    };

    function toDegree(radian) {
        return radian * (180 / Math.PI);
    }
}

var donut = new DonutComponent();
donut.init();