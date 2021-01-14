import { withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

const ActionButton = withStyles({
  root: {
    textTransform: 'none',
    justifyContent: 'left',
    width: '150px'
  }
})(Button);

export { ActionButton };