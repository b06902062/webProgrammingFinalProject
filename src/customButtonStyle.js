import { withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

const ActionButton = withStyles({
  root: {
    textTransform: 'none',
    backgroundColor: 'cornflowerblue',
    fontFamily: 'Segoe UI',
    fontSize: '20px',
  }
})(Button);

export { ActionButton };