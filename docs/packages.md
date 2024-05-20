# Packages
A `project.yaml` file allows for easier and move advanced configuration of the compiler.


### package.yaml
| key        | Description |
| ---------- | ----------- |
| src_dir    | The base directory containing source files. |
| out_dir    | The directory to write output files. |
| clean      | Delete all files in the output directory before building. |
| targets    | List of source files. see targets. |
| default    | List of the targets to build by default. |
| debug      | Enable debugging. |

### Targets
| key               | Description |
| ----------------- | ----------- |
| src               | The source file to build (relative to src_dir). |
| out               | Name of the output file. |
| targets           | A list of the formats the compiler should build (sb3, html, project.json, blocks) |
| turbowarp-fps     | Custom FPS value for HTML player. |
| turbowarp-hd-pen  | Enable higher quality pen in HTML player. |
| skip-optimization | Disable compiler optimiztions. |

## Example
project.yaml

```yaml
src_dir: ./src
out_dir: ./out
clean: true

targets:
  spiral:
    src: spiral.sw
    out: spiral
    targets:
      - sb3
      - html
    turbowarp-fps: 60

default:
  - spiral
```