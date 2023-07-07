let colorSchemes, markers, themes = {}

colorSchemes = {
  future: [
    '#00BF50',
    '#190E4F',
    '#EE4266',
    '#820263',
    '#F75C03',
    '#FFD23F',
    '#B6D094',
    '#EF2D56',
    '#E9D2F4',
    '#617073',
    '#1E152A',
    '#AD343E',
    '#30292F',
    '#02111B',
    '#F2AF29',
    '#2B0504',
    '#C1B098',
    '#3A015C',
    '#E9D2F4',
    '#531253',
    '#ED7D3A',
    '#9B9B93',
    '#363537',
    '#4E6766',
    '#3C7A89',
    '#7A93AC',
    '#BDB76B',
    '#3CB371',
    '#8A2BE2',
    '#B22222',
    '#808000',
    '#708090',
    '#FF7F50',
    '#BC8F8F',
    '#66CDAA',
    '#FF4500',
    '#483D8B',
    '#000080',
    '#8FBC8F',
    '#A0522D',
    '#FFB6C1',
    '#1E90FF',
    '#FFDAB9',
    '#DA70D6',
    '#D3D3D3',
    '#FFFF00',
    '#8B0000',
    '#F4A460',
    '#FFDEAD',
    '#FFC0CB',
    '#00BFFF',
    '#4B0082',
    '#C71585',
    '#00FA9A',
    '#9400D3',
    '#00FF7F',
    '#2E8B57',
    '#9966CC',
    '#00FF00',
    '#90EE90',
    '#D2B48C',
    '#FF69B4',
    '#FFA07A',
    '#0000FF',
    '#006400',
    '#008080',
    '#98FB98',
    '#FF00FF',
    '#FFA500',
    '#B0E0E6',
    '#20B2AA',
    '#F08080',
    '#9932CC',
    '#87CEFA',
    '#DAA520',
    '#DDA0DD',
    '#7B68EE',
    '#FFEFD5',
    '#BA55D3',
    '#FF8C00',
    '#E6E6FA',
    '#FF6347',
    '#FA8072',
    '#4169E1',
    '#6495ED',
    '#DC143C',
    '#191970',
    '#FFF0F5',
    '#FFE4E1',
    '#DEB887',
    '#FF0000',
    '#ADFF2F',
    '#4682B4',
    '#FFFACD',
    '#E9967A',
    '#B0C4DE',
    '#8B008B',
    '#696969',
    '#228B22',
    '#008B8B'
  ]
}

markers = {
  future: {
    enabled: true,
    lineWidth: 2,
    radius: 5,
    fillColor: null,
    lineColor: '#FFFFFF',
    symbol: 'circle',
    states: {
      hover: {
        lineWidth: 3,
        radius: 6
      }
    }
  }
}

themes.future = {
  chart: {
    style: {
      fontFamily: ['Quicksand', '-apple-system', 'system-ui', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
    }
  },
  xAxis: {
    lineColor: '#ccc'
  },
  yAxis: {
    gridLineColor: '#e0e0e0'
  },
  credits: false,
  legend: {
    borderRadius: 0,
    borderWidth: 0,
    align: 'center',
    x: 15
  },
  colors: colorSchemes.future,
  plotOptions: {
    line: {
      marker: markers.future
    },
    bar: {
      dataLabels: {
        style: {
          textOutline: false
        }
      }
    }
  }
}

module.exports = {
  themes: themes
}
