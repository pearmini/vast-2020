import { connect } from 'dva';

export default connect(({ global }) => ({ ...global }), {
  getData: () => ({ type: "global/getData" }),
});
