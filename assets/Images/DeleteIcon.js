import {createIcon} from '@gluestack-ui/themed';
import {Path, Rect, Svg} from 'react-native-svg';

export const DeleteIcon = createIcon({
  viewBox: '0 0 32 32',
  path: (
    <>
      <Svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24px"
        height="24px">
        <Path d="M10.807 2c-.517 0-1.011.204-1.377.57L9 3H4a1 1 0 100 2h16a1 1 0 100-2h-5l-.43-.43A1.943 1.943 0 0013.193 2h-2.386zM4.365 7l1.528 13.264c.132.99.984 1.736 1.982 1.736h8.248c.998 0 1.851-.745 1.984-1.744L19.635 7H4.365z" />
      </Svg>
    </>
  ),
});
