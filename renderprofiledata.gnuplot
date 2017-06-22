set datafile separator ","
set autoscale fix
set terminal png size 1400, 800
set output '01_CPU.png'
set xlabel 'BLOCK #'
set ylabel 'CPU %'
plot 'profile.csv' using 2 title "CPU %" with lines
set ylabel 'RSS (MB)'
set output '02_RSS.png'
plot 'profile.csv' using 3 title "RSS" with lines
set ylabel 'Heap (MB)'
set output '03_HeapTotal.png'
plot 'profile.csv' using 4 title "Heap Total" with lines
set output '04_HeapUsed.png'
set ylabel 'Heap (MB)'
plot 'profile.csv' using 5 title "Heap Used" with lines

set output '05_All.png'
set ylabel 'All Metrics'
plot 'profile.csv' using 0:2 with lines title 'CPU', '' using 0:3 with lines title 'RSS', '' using 0:4 with lines title 'HEAP TOTAL', '' using 0:5 with lines title 'HEAP USED'

