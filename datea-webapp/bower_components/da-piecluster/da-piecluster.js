( function () {

	'use strict';

	var daPiecluster = angular.module( 'daPiecluster', [] );

	daPiecluster.constant( 'pieclusterConfig',
	{ defaultColor         : '#28BC45'
	, defaultColor1        : '#CCC'
	, clusterIconClassName : 'marker-cluster'
	, polygonOptions : { weight      : 1
	                   , fillColor   : '#999'
	                   , color       : '#999'
	                   , fillOpacity : 0.4
	                   }
	} );

	daPiecluster.service( 'Piecluster', function Piecluster( pieclusterConfig ) {
		var clusterSizeRange
		  , serializeXmlNode
		  , makeSVGPie
		  , initSizeRange
		  ;

		initSizeRange = function(domain, range) {
			if (!domain) domain = [0,100];
			if (!range) range = [50,80];
			
			clusterSizeRange = d3.scale.linear()
			  .domain( domain )
			  .range( range )
			  .clamp( true );
		}
		initSizeRange();

		makeSVGPie = function ( givens ) {
			var svg
			  , vis
			  , arc
			  , pie
			  , arcs
			  , campaign
			  , tags
			  , secondaryTags
			  , opacity
			;

			campaign      = givens && givens.campaign;
			tags          = givens && givens.tags;
			secondaryTags = givens && givens.secondaryTags;
			opacity 	  = givens.opacity || 0.75;
			

			svg = document.createElementNS( d3.ns.prefix.svg, 'svg' );
			vis = d3.select( svg ).data( [ givens.data ] )
			  .attr( 'class', 'datea-svg-cluster' )
			  .attr( 'width', givens.d )
			  .attr( 'height', givens.d )
			  .append( 'svg:g' )
			  .attr( 'transform', 'translate('+givens.r+','+givens.r+')' );

			arc  = d3.svg.arc().outerRadius( givens.r );
			pie  = d3.layout.pie().value( function ( d ) { return d.value; } );
			arcs = vis.selectAll( 'g.slice' ).data( pie ).enter().append( 'svg:g' ).attr( 'class', 'slice' );
			arcs.append( 'svg:path' )
			.attr( 'fill', function ( a ){
				if ( ( campaign && !campaign.secondary_tags.length ) || ( tags && tags.length ) === 0 ) {
					return pieclusterConfig.defaultColor;
				} else if ( a.data.tag === 'Otros' ) {
					return pieclusterConfig.defaultColor1;
				} else {
					return secondaryTags[a.data.tag].color;
				}
			})
			.attr( 'data-svg-slice-id', function ( a ) {
				return a.data.ids;
			})
			.attr( 'd', arc )
			.attr( 'opacity', opacity );

			if (givens.n > 1) {
				vis.append( 'circle' )
				   .attr( 'fill', '#fff' )
				   .attr( 'r', givens.r / 2.2 )
				   .attr( 'cx', 0 )
				   .attr( 'cy', 0 );

				vis.append( 'text' )
				   .attr( 'x', 0 )
				   .attr( 'y', 0 )
				   .attr( 'class', 'cpie-label' )
				   .attr( 'text-anchor', 'middle' )
				   .attr( 'dy', '.33em' )
				   .text( givens.n );
			}

			return serializeXmlNode( svg );
		};

		serializeXmlNode = function ( xmlNode ) {
			if ( typeof window.XMLSerializer !== 'undefined' ) {
				return ( new window.XMLSerializer() ).serializeToString( xmlNode );
			} else if ( typeof xmlNode.xml !== 'undefined' ) {
				return xmlNode.xml;
			}
			return '';
		};

		return { clusterSizeRange : clusterSizeRange
			   , initSizeRange    : initSizeRange
		       , serializeXmlNode : serializeXmlNode
		       , makeSVGPie       : makeSVGPie
		       , pieclusterConfig : pieclusterConfig
		       };
	} );

} ).call(this);
