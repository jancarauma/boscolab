<style>
  table {
    border-collapse: collapse;
    margin: 1rem 0;
  }
  table, th, td {
    border: 1px solid darkgray;
  }
  th, td {
    padding: 5px;
    text-align: left;
  }
  th {
    font-weight: bold;
  }
</style>


<p>
    As seguintes definições de unidades são suportadas pelo Boscolab (da documentação do <a
        href="https://mathjs.org/docs/datatypes/units.html#reference">Math.js</a>).
    As unidades podem ser usadas em suas formas completas ou abreviadas (meter ou m) e podem ser usadas tanto no singular quanto no plural (second ou seconds).
</p>

<table>
    <thead>
        <tr>
            <th>Base</th>
            <th>Unidade</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Comprimento</td>
            <td
                >meter (m), inch (in), foot (ft), yard (yd), mile (mi), link
                (li), rod (rd), chain (ch), angstrom, mil</td
            >
        </tr>
        <tr>
            <td>Área</td>
            <td>m2, sqin, sqft, sqyd, sqmi, sqrd, sqch, sqmil, acre, hectare</td
            >
        </tr>
        <tr>
            <td>Volume</td>
            <td
                >m3, litre (l, L, lt, liter), cc, cuin, cuft, cuyd, teaspoon,
                tablespoon</td
            >
        </tr>
        <tr>
            <td>Volume (Líquido)</td>
            <td
                >minim, fluiddram (fldr), fluidounce (floz), gill (gi), cup
                (cp), pint (pt), quart (qt), gallon (gal), beerbarrel (bbl),
                oilbarrel (obl), hogshead, drop (gtt)</td
            >
        </tr>
        <tr>
            <td>Ângulo</td>
            <td
                >rad (radian), deg (degree), grad (gradian), cycle, arcsec
                (arcsecond), arcmin (arcminute)</td
            >
        </tr>
        <tr>
            <td>Tempo</td>
            <td
                >second (s, secs, seconds), minute (min, mins, minutes), hour
                (h, hr, hrs, hours), day (days), week (weeks), month (months),
                year (years), decade (decades), century (centuries), millennium
                (millennia)</td
            >
        </tr>
        <tr>
            <td>Frequência</td>
            <td>hertz (Hz)</td>
        </tr>
        <tr>
            <td>Massa</td>
            <td
                >gram(g), tonne, ton, grain (gr), dram (dr), ounce (oz),
                poundmass (lbm, lb, lbs), hundredweight (cwt), stick, stone</td
            >
        </tr>
        <tr>
            <td>Corrente Elétrica</td>
            <td>ampere (A)</td>
        </tr>
        <tr>
            <td>Temperatura</td>
            <td
                >kelvin (K), celsius (degC), fahrenheit (degF), rankine (degR)</td
            >
        </tr>
        <tr>
            <td>Quantidade de Matéria</td>
            <td>mole (mol)</td>
        </tr>
        <tr>
            <td>Intensidade Luminosa</td>
            <td>candela (cd)</td>
        </tr>
        <tr>
            <td>Força</td>
            <td>
                newton (N), dyne (dyn), poundforce (lbf), kip, kilogramforce (kgf),
                gramforce (gf)
            </td>
        </tr>
        <tr>
            <td>Energia</td>
            <td>joule (J), erg, Wh, BTU (Btu), electronvolt (eV)</td>
        </tr>
        <tr>
            <td>Potência</td>
            <td>
                watt (W), hp, tonrefrigeration (TR, RT, TOR, toncooling), boilerhp (BHP),
                MBH, MMBH
            </td>
        </tr>
        <tr>
            <td>Pressão</td>
            <td>
                Pa, psi, atm, torr, bar, mmHg, mmH2O, cmH2O, 
                inHg, inH2O, ftH2O, kpsi (ksi), Mpsi
            </td>
        </tr>
        <tr>
            <td>Eletromagnetismo</td>
            <td>ampere (A), coulomb (C), watt (W), volt (V), ohm, farad (F),
                weber (Wb), tesla (T), henry (H), siemens (S), electronvolt (eV)
            </td>
        </tr>
        <tr>
            <td>Viscosidade</td>
            <td>
                poise (P), reyn, ureyn, stokes (St)
            </td>
        </tr>
        <tr>
            <td>Informação</td>
            <td>bits (b), bytes (B)</td>
        </tr>
    </tbody>
</table>

<h4>Prefixos de Unidade Suportados</h4>
<table>
    <thead>
        <tr>
            <th>Nome</th>
            <th>Abreviação</th>
            <th>Valor</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>deca</td>
            <td>da</td>
            <td>1e1</td>
        </tr>
        <tr>
            <td>hecto</td>
            <td>h</td>
            <td>1e2</td>
        </tr>
        <tr>
            <td>kilo</td>
            <td>k</td>
            <td>1e3</td>
        </tr>
        <tr>
            <td>mega</td>
            <td>M</td>
            <td>1e6</td>
        </tr>
        <tr>
            <td>giga</td>
            <td>G</td>
            <td>1e9</td>
        </tr>
        <tr>
            <td>tera</td>
            <td>T</td>
            <td>1e12</td>
        </tr>
        <tr>
            <td>peta</td>
            <td>P</td>
            <td>1e15</td>
        </tr>
        <tr>
            <td>exa</td>
            <td>E</td>
            <td>1e18</td>
        </tr>
        <tr>
            <td>zetta</td>
            <td>Z</td>
            <td>1e21</td>
        </tr>
        <tr>
            <td>yotta</td>
            <td>Y</td>
            <td>1e24</td>
        </tr>
    </tbody>
</table>

<table>
    <thead>
        <tr>
            <th>Nome</th>
            <th>Abreviação</th>
            <th>Valor</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>deci</td>
            <td>d</td>
            <td>1e-1</td>
        </tr>
        <tr>
            <td>centi</td>
            <td>c</td>
            <td>1e-2</td>
        </tr>
        <tr>
            <td>milli</td>
            <td>m</td>
            <td>1e-3</td>
        </tr>
        <tr>
            <td>micro</td>
            <td>u</td>
            <td>1e-6</td>
        </tr>
        <tr>
            <td>nano</td>
            <td>n</td>
            <td>1e-9</td>
        </tr>
        <tr>
            <td>pico</td>
            <td>p</td>
            <td>1e-12</td>
        </tr>
        <tr>
            <td>femto</td>
            <td>f</td>
            <td>1e-15</td>
        </tr>
        <tr>
            <td>atto</td>
            <td>a</td>
            <td>1e-18</td>
        </tr>
        <tr>
            <td>zepto</td>
            <td>z</td>
            <td>1e-21</td>
        </tr>
        <tr>
            <td>yocto</td>
            <td>y</td>
            <td>1e-24</td>
        </tr>
    </tbody>
</table>

<h4>Prefixos Binários de Unidade Suportados</h4>
<p>Para uso com bits (b) ou bytes (B)</p>

<table>
    <thead>
        <tr>
            <th>Nome</th>
            <th>Abreviação</th>
            <th>Valor</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>kibi</td>
            <td>Ki</td>
            <td>1024</td>
        </tr>
        <tr>
            <td>mebi</td>
            <td>Mi</td>
            <td>1024^2</td>
        </tr>
        <tr>
            <td>gibi</td>
            <td>Gi</td>
            <td>1024^3</td>
        </tr>
        <tr>
            <td>tebi</td>
            <td>Ti</td>
            <td>1024^4</td>
        </tr>
        <tr>
            <td>pebi</td>
            <td>Pi</td>
            <td>1024^5</td>
        </tr>
        <tr>
            <td>exi</td>
            <td>Ei</td>
            <td>1024^6</td>
        </tr>
        <tr>
            <td>zebi</td>
            <td>Zi</td>
            <td>1024^7</td>
        </tr>
        <tr>
            <td>yobi</td>
            <td>Yi</td>
            <td>1024^8</td>
        </tr>
    </tbody>
</table>

<table>
    <thead>
        <tr>
            <th>Nome</th>
            <th>Abreviação</th>
            <th>Valor</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>kilo</td>
            <td>k</td>
            <td>1e3</td>
        </tr>
        <tr>
            <td>mega</td>
            <td>M</td>
            <td>1e6</td>
        </tr>
        <tr>
            <td>giga</td>
            <td>G</td>
            <td>1e9</td>
        </tr>
        <tr>
            <td>tera</td>
            <td>T</td>
            <td>1e12</td>
        </tr>
        <tr>
            <td>peta</td>
            <td>P</td>
            <td>1e15</td>
        </tr>
        <tr>
            <td>exa</td>
            <td>E</td>
            <td>1e18</td>
        </tr>
        <tr>
            <td>zetta</td>
            <td>Z</td>
            <td>1e21</td>
        </tr>
        <tr>
            <td>yotta</td>
            <td>Y</td>
            <td>1e24</td>
        </tr>
    </tbody>
</table>

