import React, { Component } from 'react';

import {
  Table, Button, Icon, Spin, Popover,
} from 'choerodon-ui';
import { Page, Header } from 'choerodon-front-boot';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import _ from 'lodash';
import ReactEcharts from 'echarts-for-react';
import { RadioButton } from '../../../../components/CommonComponent';
import {
  getCaseNotPlain, getCaseNotRun, getCaseNum, getCycleRange, getCreateRange, getIssueStatistic,
} from '../../../../api/summaryApi';
import {
  getProjectVersion, getLabels, getModules, getIssueCount,
} from '../../../../api/agileApi';
import './SummaryHome.scss';

class SummaryHome extends Component {
  state = {
    loading: false,
    range: '7',
    excuteList: [],
    createList: [],
    totalTest: 0,
    notPlan: 0,
    notRun: 0,
    caseNum: 0,
    totalExcute: 0,
    totalCreate: 0,
    versionTable: [],
    componentTable: [],
    labelTable: [],
  }

  componentDidMount() {
    this.getInfo();
  }

  getInfo = () => {
    this.setState({ loading: true });
    const { date, range } = this.state;
    Promise.all([getIssueCount(), getCaseNotPlain(), getCaseNotRun(), getCaseNum(),
      getCycleRange(moment().format('YYYY-MM-DD'), range),
      getCreateRange(range), getProjectVersion(), getModules(), getLabels()])
      .then(([totalData, notPlan, notRun, caseNum, excuteList,
        createList, versionList, componentList, labelList]) => {
        this.setState({
          
          // totalIssue: totalIssueData.totalElements,
          totalTest: totalData.totalElements,
          notPlan,
          notRun,
          caseNum,
          excuteList: this.listTransform(excuteList),
          totalExcute: _.sum(excuteList),
          createList: this.createTransform(createList, range),
          totalCreate: _.sumBy(createList, 'issueCount'),
        });
        Promise.all([
          this.getVersionTable(versionList),
          this.getLabelTable(labelList),
          this.getComponentTable(componentList),
        ]).then(([versionTable, labelTable, componentTable]) => {
          this.setState({
            loading: false,
            versionTable,
            labelTable,
            componentTable,
          });
        });
      }).catch(() => {
        this.setState({ loading: false });
        Choerodon.prompt('网络异常');
      });
  }

  getVersionTable = versionList => new Promise((resolve) => {
    getIssueStatistic('version').then((data) => {
      const versionTable = versionList.reverse().map((version) => {
        let num = 0;
        if (_.find(data, { typeName: version.versionId.toString() })) {
          num = _.find(data, { typeName: version.versionId.toString() }).value;
        }
        return { name: version.name, versionId: version.versionId, num };
      });
      // const noVersionData = _.find(data, { typeName: null }) || {};
      // const noVersion = {
      //   num: noVersionData.value || 0,
      //   id: null,
      //   name: <FormattedMessage id="summary_noVersion" />,
      // };
      // versionTable.unshift(noVersion);
      resolve(versionTable);
    });
  })

  getLabelTable = labelList => new Promise((resolve) => {
    getIssueStatistic('label').then((data) => {
      const labelTable = labelList.map((label) => {
        let num = 0;
        if (_.find(data, { typeName: label.labelId.toString() })) {
          num = _.find(data, { typeName: label.labelId.toString() }).value;
        }
        return { name: label.labelName, id: label.labelId, num };
      });
      // 加入无标签项
      const noLabelData = _.find(data, { typeName: null }) || {};
      const noLabel = {
        num: noLabelData.value || 0,
        id: null,
        name: <FormattedMessage id="summary_noLabel" />,
      };
      labelTable.unshift(noLabel);
      resolve(labelTable);
    });
  })

  getComponentTable = componentList => new Promise((resolve) => {
    getIssueStatistic('component').then((data) => {
      const componentTable = componentList.map((component) => {
        let num = 0;
        if (_.find(data, { typeName: component.componentId.toString() })) {
          num = _.find(data, { typeName: component.componentId.toString() }).value;
        }
        return { name: component.name, id: component.componentId, num };
      });
      const noComponentData = _.find(data, { typeName: null }) || {};
      const noComponent = {
        num: noComponentData.value || 0,
        id: null,
        name: <FormattedMessage id="summary_noComponent" />,
      };
      componentTable.unshift(noComponent);
      resolve(componentTable);
    });
  })

  handleRangeChange = (e) => {
    this.setState({ loading: true });
    Promise.all([
      getCycleRange(moment().format('YYYY-MM-DD'), e.target.value),
      getCreateRange(e.target.value)]).then(([excuteList, createList]) => {
      this.setState({
        loading: false,
        range: e.target.value,
        excuteList: this.listTransform(excuteList),
        totalExcute: _.sum(excuteList),
        createList: this.createTransform(createList, e.target.value),
        totalCreate: _.sumBy(createList, 'issueCount'),
      });
    });
  }

  createTransform = (source, range) => Array(Number(range)).fill(0).map((item, i) => {
    const time = moment().subtract(range - i - 1, 'days').format('YYYY-MM-DD');
    if (_.find(source, { creationDay: time })) {
      const { creationDay, issueCount } = _.find(source, { creationDay: time });
      return {
        time: moment(creationDay).format('D/MMMM'),
        value: issueCount,
      };
    } else {
      return {
        time: moment().subtract(range - i - 1, 'days').format('D/MMMM'),
        value: 0,
      };
    }
  });

  listTransform = list => list.map((item, i) => ({
    time: moment().subtract(list.length - i - 1, 'days').format('D/MMMM'),
    value: item,
  }))

  getCreateOption = () => ({
    // title: {
    //   text: '折线图堆叠',
    // },
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      top: '13%',
      left: 38,
      right: '8%',
      bottom: '23%',
      // containLabel: true,
    },
    xAxis: {
      type: 'category',
      name: '日期',
      // nameGap: 28,
      nameTextStyle: {
        color: 'black',
      },
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#EEEEEE',
          // width: 8, // 这里是为了突出显示加上的
        },
      },
      axisLabel: {
        show: true,
        textStyle: {
          color: 'rgba(0,0,0,0.65)',
        },
      },
      splitLine: {
        show: true,
        //  改变轴线颜色
        lineStyle: {
          // 使用深浅的间隔色
          color: ['#EEEEEE'],
        },
      },
      // data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      data: this.state.createList.map(execute => execute.time),
    },
    yAxis: {
      type: 'value',
      name: '数值',
      nameTextStyle: {
        color: 'black',
      },
      axisLine: {
        lineStyle: {
          color: '#EEEEEE',
          // width: 8, // 这里是为了突出显示加上的
        },
      },
      axisLabel: {
        show: true,
        textStyle: {
          color: 'rgba(0,0,0,0.65)',
        },
      },
      splitLine: {
        show: true,
        //  改变轴线颜色
        lineStyle: {
          // 使用深浅的间隔色
          color: ['#EEEEEE'],
        },
      },
      minInterval: 1,
    },
    series: [
      {
        name: '创建数',
        type: 'line',
        stack: '总量',
        data: this.state.createList.map(execute => execute.value),
      },
    ],
    color: ['#5266D4'],
  })

  getExecuteOption = () => ({
    // title: {
    //   text: '折线图堆叠',
    // },
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      top: '13%',
      left: 38,
      right: '8%',
      bottom: '23%',
      // containLabel: true,
    },
    xAxis: {
      type: 'category',
      name: '日期',
      // nameGap: 28,
      nameTextStyle: {
        color: 'black',
      },
      // nameLocation: 'middle',
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#EEEEEE',
          // width: 8, // 这里是为了突出显示加上的
        },
      },
      axisLabel: {
        show: true,
        textStyle: {
          color: 'rgba(0,0,0,0.65)',
        },
      },
      splitLine: {
        show: true,
        //  改变轴线颜色
        lineStyle: {
          // 使用深浅的间隔色
          color: ['#EEEEEE'],
        },
      },
      // data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      data: this.state.excuteList.map(execute => execute.time),
    },
    yAxis: {
      type: 'value',
      name: '数值',
      nameTextStyle: {
        color: 'black',
      },
      axisLine: {
        lineStyle: {
          color: '#EEEEEE',
          // width: 8, // 这里是为了突出显示加上的
        },
      },
      axisLabel: {
        show: true,
        textStyle: {
          color: 'rgba(0,0,0,0.65)',
        },
      },
      splitLine: {
        show: true,
        //  改变轴线颜色
        lineStyle: {
          // 使用深浅的间隔色
          color: ['#EEEEEE'],
        },
      },
      minInterval: 1,
    },
    series: [
      {
        name: '执行数',
        type: 'line',
        stack: '总量',
        data: this.state.excuteList.map(execute => execute.value),
      },
    ],
    color: ['#00BFA5'],
  })

  render() {
    const {
      loading, range, totalExcute,
      totalCreate, totalTest, notPlan, notRun, caseNum, versionTable,
      labelTable, componentTable,
    } = this.state;
    // window.console.log(labelTable);
    const versionColumns = [{
      title: <FormattedMessage id="summary_version" />,
      dataIndex: 'name',
      key: 'name',
    }, {
      title: <FormattedMessage id="summary_num" />,
      dataIndex: 'num',
      key: 'num',
    }];
    const labelColumns = [{
      title: <FormattedMessage id="summary_label" />,
      dataIndex: 'name',
      key: 'name',
    }, {
      title: <FormattedMessage id="summary_num" />,
      dataIndex: 'num',
      key: 'num',
    }];
    const componentColumns = [{
      title: <FormattedMessage id="summary_component" />,
      dataIndex: 'name',
      key: 'name',
    }, {
      title: <FormattedMessage id="summary_num" />,
      dataIndex: 'num',
      key: 'num',
    }];
    return (
      <Page>
        <Header title={<FormattedMessage id="summary_title" />}>
          <Button onClick={this.getInfo}>
            <Icon type="autorenew icon" />
            <span><FormattedMessage id="refresh" /></span>
          </Button>
        </Header>
        <Spin spinning={loading}>
          <div className="c7ntest-content-container">
            <div className="c7ntest-statistic-container">
              <Popover
                placement="topLeft"
                content={<div><FormattedMessage id="summary_totalTest_tip" /></div>}
                title={null}
              >
                <div className="c7ntest-statistic-item-container">
                  <div className="c7ntest-statistic-item-colorBar" />
                  <div>
                    <div className="c7ntest-statistic-item-title"><FormattedMessage id="summary_totalTest" /></div>
                    <div className="c7ntest-statistic-item-num">{totalTest}</div>
                  </div>
                </div>
              </Popover>
              <Popover
                placement="topLeft"
                content={(
                  <div>
                    <FormattedMessage id="summary_total_tip1" />
                    <FormattedMessage
                      id="summary_total_tip2"
                      values={{
                        text: <strong style={{ color: 'rgb(255, 85, 0)' }}>{Choerodon.getMessage('未执行', 'not executed')}</strong>,
                      }}
                    />
                    <FormattedMessage id="summary_totalRest_tip3" />
                  </div>)
                }
                title={null}
              >
                <div className="c7ntest-statistic-item-container">
                  <div className="c7ntest-statistic-item-colorBar" style={{ borderColor: '#FFB100' }} />
                  <div>
                    <div className="c7ntest-statistic-item-title"><FormattedMessage id="summary_totalRest" /></div>
                    <div className="c7ntest-statistic-item-num">{notRun}</div>
                  </div>
                </div>
              </Popover>
              <Popover
                placement="topLeft"
                content={(
                  <div>
                    <FormattedMessage id="summary_total_tip1" />
                    <FormattedMessage
                      id="summary_total_tip2"
                      values={{
                        text: <strong style={{ color: 'rgb(255, 85, 0)' }}>{Choerodon.getMessage('未执行以外', 'out of not executed')}</strong>,
                      }}
                    />
                    <FormattedMessage id="summary_totalExexute_tip3" />
                  </div>)
                }
                title={null}
              >
                <div className="c7ntest-statistic-item-container">
                  <div className="c7ntest-statistic-item-colorBar" style={{ borderColor: '#00BFA5' }} />
                  <div>
                    <div className="c7ntest-statistic-item-title"><FormattedMessage id="summary_totalExexute" /></div>
                    <div className="c7ntest-statistic-item-num">{caseNum - notRun}</div>
                  </div>
                </div>
              </Popover>
              <Popover
                placement="topLeft"
                content={<div><FormattedMessage id="summary_totalNotPlan_tip" /></div>}
                title={null}
              >
                <div className="c7ntest-statistic-item-container">
                  <div className="c7ntest-statistic-item-colorBar" style={{ borderColor: '#FF7043' }} />
                  <div>
                    <div className="c7ntest-statistic-item-title"><FormattedMessage id="summary_totalNotPlan" /></div>
                    <div className="c7ntest-statistic-item-num">{totalTest - notPlan}</div>
                  </div>
                </div>
              </Popover>
            </div>
            <div className="c7ntest-tableArea-container">
              <div className="c7ntest-table-container">
                <div className="c7ntest-table-title">
                  <FormattedMessage id="summary_testSummary" />
                  {'（'}
                  <FormattedMessage id="summary_summaryByVersion" />
                  {'）'}
                </div>
                <Table
                  // rowKey="name"
                  style={{ height: 180 }}
                  columns={versionColumns}
                  pagination={{ pageSize: 5, showSizeChanger: false }}
                  dataSource={versionTable}
                  filterBar={false}
                />
              </div>
              <div className="c7ntest-table-container" style={{ margin: '0 15px' }}>
                <div className="c7ntest-table-title">
                  <FormattedMessage id="summary_testSummary" />
                  {'（'}
                  <FormattedMessage id="summary_summaryByComponent" />
                  {' ）'}
                </div>
                <Table
                  // rowKey="name"
                  style={{ height: 180 }}
                  columns={componentColumns}
                  pagination={{ pageSize: 5, showSizeChanger: false }}
                  dataSource={componentTable}
                  filterBar={false}
                />
              </div>
              <div className="c7ntest-table-container">
                <div className="c7ntest-table-title">
                  <FormattedMessage id="summary_testSummary" />
                  {'（'}
                  <FormattedMessage id="summary_summaryByLabel" />
                  {' ）'}
                </div>
                <Table
                  // rowKey="name"
                  style={{ height: 180 }}
                  columns={labelColumns}
                  pagination={{ pageSize: 5, showSizeChanger: false }}
                  dataSource={labelTable}
                  filterBar={false}
                />
              </div>
            </div>
            <div style={{ margin: '30px 20px 18px 20px', display: 'flex', alignItems: 'center' }}>
              <div>
                <FormattedMessage id="summary_summaryTimeLeap" />
                {'：'}
              </div>
              <RadioButton
                defaultValue={range}
                onChange={this.handleRangeChange}
                data={[{
                  value: '7',
                  text: [7, <FormattedMessage id="day" />],
                }, {
                  value: '15',
                  text: [15, <FormattedMessage id="day" />],
                },
                {
                  value: '30',
                  text: [30, <FormattedMessage id="day" />],
                }]}
              />
            </div>
            <div className="c7ntest-chartArea-container">

              <div className="c7ntest-chart-container">
                <div style={{ fontWeight: 500, margin: '12px 12px 0 12px' }}><FormattedMessage id="summary_testCreate" /></div>
                <div style={{ height: 260 }}>
                  <ReactEcharts
                    option={this.getCreateOption()}
                  />
                </div>
                <div style={{ color: 'rgba(0,0,0,0.65)', marginLeft: 38 }}>
                  <FormattedMessage id="summary_testCreated" />
                  {'：'}
                  <span style={{ color: 'black', fontWeight: 500 }}>{totalCreate}</span>
                  {'，'}
                  <FormattedMessage id="summary_testLast" />
                  <span style={{ color: 'black', fontWeight: 500 }}>
                    {' '}
                    {range}
                    {' '}
                  </span>
                  <FormattedMessage id="day" />
                </div>
              </div>
              <div className="c7ntest-chart-container" style={{ marginLeft: 16 }}>
                <div style={{ fontWeight: 500, margin: '12px 12px 0 12px' }}><FormattedMessage id="summary_testExecute" /></div>
                <div style={{ height: 260 }}>
                  <ReactEcharts
                    option={this.getExecuteOption()}
                  />
                </div>
                <div style={{ color: 'rgba(0,0,0,0.65)', marginLeft: 38 }}>
                  <FormattedMessage id="summary_testExecuted" />
                  {'：'}
                  <span style={{ color: 'black', fontWeight: 500 }}>{totalExcute}</span>
                  {'，'}
                  <FormattedMessage id="summary_testLast" />
                  <span style={{ color: 'black', fontWeight: 500 }}>
                    {' '}
                    {range}
                    {' '}
                  </span>
                  <FormattedMessage id="day" />
                </div>
              </div>
            </div>
          </div>
        </Spin>
      </Page>
    );
  }
}

SummaryHome.propTypes = {

};

export default SummaryHome;
